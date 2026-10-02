import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, withTransaction, type Sql } from "@/lib/db";
import { FREE_SHIPPING_THRESHOLD, RESERVATION_MINUTES, STANDARD_SHIPPING } from "./constants";
import { hydrateOrders, hydrateProducts, productSelect } from "./hydrate";
import { optionalAuthMiddleware } from "./optional-auth";
import { ensureProfile } from "./profiles";
import { createRazorpayOrder, getRazorpayCredentials, verifyRazorpaySignature } from "./razorpay";
import type { CheckoutSession, Order, OrderConfirmation, ShippingAddress } from "./types";

const shippingSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8).max(16),
  address: z.string().min(4),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(5).max(10),
});

const cartLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
  size: z.string().min(1),
  color: z.string().min(1),
});

const checkoutSchema = z.object({
  items: z.array(cartLineSchema).min(1).max(20),
  shippingAddress: shippingSchema,
});

const verifySchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

async function releaseExpiredReservations(sql: Sql) {
  const expired = await sql.query<{ id: string }>(
    `select id from uv_orders
     where status = 'pending' and payment_status = 'pending' and expires_at <= now()
     for update`,
  );
  const now = new Date().toISOString();
  for (const order of expired) {
    const cancelled = await sql.query<{ id: string }>(
      `update uv_orders
       set status = 'cancelled', payment_status = 'failed', updated_at = $2
       where id = $1 and status = 'pending' and payment_status = 'pending'
       returning id`,
      [order.id, now],
    );
    if (!cancelled[0]) continue;
    const lines = await sql.query<{ product_id: string | null; quantity: number }>(
      "select product_id, quantity from uv_order_items where order_id = $1",
      [order.id],
    );
    const reservedByProduct = new Map<string, number>();
    for (const line of lines) {
      if (line.product_id) {
        reservedByProduct.set(
          line.product_id,
          (reservedByProduct.get(line.product_id) ?? 0) + Number(line.quantity),
        );
      }
    }
    for (const [productId, quantity] of reservedByProduct) {
      await sql.query(
        `update uv_inventory
         set reserved = greatest(reserved - $2, 0), updated_at = $3
         where product_id = $1`,
        [productId, quantity, now],
      );
    }
  }
}

export const createCheckoutOrder = createServerFn({ method: "POST" })
  .middleware([optionalAuthMiddleware])
  .validator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ data, context }): Promise<CheckoutSession> => {
    const credentials = getRazorpayCredentials();
    if (!credentials) {
      throw new Error(
        "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the server environment.",
      );
    }
    if (context.userId) {
      await ensureProfile(context.userId, context.userEmail);
    }

    const { items, shippingAddress } = data;
    const productIds = [...new Set(items.map((item) => item.productId))];
    const placeholders = productIds.map((_, i) => `$${i + 1}`).join(", ");

    type JoinRow = Parameters<typeof hydrateProducts>[1][number];
    const rows = await withTransaction(async (sql) => {
      await releaseExpiredReservations(sql);
      return sql.query<JoinRow>(
        `select ${productSelect}
         from uv_products p
         inner join uv_categories c on c.id = p.category_id
         inner join uv_inventory i on i.product_id = p.id
         where p.id in (${placeholders}) and p.published = true`,
        productIds,
      );
    });
    if (rows.length !== productIds.length) {
      throw new Error("One or more products are no longer available.");
    }
    const products = await hydrateProducts(await getSql(), rows);
    const productById = new Map(products.map((product) => [product.id, product]));
    const quantityByProduct = new Map<string, number>();
    const orderItemValues: {
      productId: string;
      productName: string;
      sku: string;
      imageUrl: string | null;
      quantity: number;
      unitPrice: string;
      size: string;
      color: string;
    }[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productById.get(item.productId);
      if (!product) throw new Error("One or more products are no longer available.");
      if (!product.sizes.includes(item.size) || !product.colors.includes(item.color)) {
        throw new Error("A selected size or color is unavailable.");
      }
      const quantity = (quantityByProduct.get(item.productId) ?? 0) + item.quantity;
      quantityByProduct.set(item.productId, quantity);
      if (quantity > product.stock) {
        throw new Error(`${product.name} does not have enough stock.`);
      }
      subtotal += product.price * item.quantity;
      orderItemValues.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        imageUrl: product.images[0]?.url ?? null,
        quantity: item.quantity,
        unitPrice: product.price.toFixed(2),
        size: item.size,
        color: item.color,
      });
    }

    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
    const total = subtotal + shipping;
    const amount = Math.round(total * 100);
    const appOrderId = randomUUID();
    const orderNumber = `UV-${Date.now().toString().slice(-8)}-${randomUUID()
      .slice(0, 4)
      .toUpperCase()}`;

    let razorpayOrderId: string;
    try {
      razorpayOrderId = await createRazorpayOrder(
        credentials.keyId,
        credentials.keySecret,
        appOrderId,
        orderNumber,
        amount,
      );
    } catch {
      throw new Error("Payment could not be initialized. Please try again.");
    }

    const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60_000).toISOString();
    try {
      await withTransaction(async (sql) => {
        await sql.query(
          `insert into uv_orders (
            id, order_number, customer_id, customer_name, customer_email, customer_phone,
            shipping_address, subtotal, shipping, total, status, payment_status,
            razorpay_order_id, expires_at
          ) values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,'pending','pending',$11,$12)`,
          [
            appOrderId,
            orderNumber,
            context.userId,
            shippingAddress.fullName,
            shippingAddress.email,
            shippingAddress.phone,
            JSON.stringify(shippingAddress),
            subtotal.toFixed(2),
            shipping.toFixed(2),
            total.toFixed(2),
            razorpayOrderId,
            expiresAt,
          ],
        );
        for (const [productId, quantity] of quantityByProduct) {
          const reserved = await sql.query<{ product_id: string }>(
            `update uv_inventory
             set reserved = reserved + $2, updated_at = now()
             where product_id = $1 and stock - reserved >= $2
             returning product_id`,
            [productId, quantity],
          );
          if (!reserved[0]) throw new Error("OUT_OF_STOCK");
        }
        for (const item of orderItemValues) {
          await sql.query(
            `insert into uv_order_items (
              order_id, product_id, product_name, sku, image_url, quantity, unit_price, size, color
            ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [
              appOrderId,
              item.productId,
              item.productName,
              item.sku,
              item.imageUrl,
              item.quantity,
              item.unitPrice,
              item.size,
              item.color,
            ],
          );
        }
        if (context.userId) {
          await sql.query(
            `insert into uv_addresses (
              customer_id, full_name, email, phone, address, city, state, pincode
            ) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [
              context.userId,
              shippingAddress.fullName,
              shippingAddress.email,
              shippingAddress.phone,
              shippingAddress.address,
              shippingAddress.city,
              shippingAddress.state,
              shippingAddress.pincode,
            ],
          );
        }
      });
    } catch (error) {
      if (error instanceof Error && error.message === "OUT_OF_STOCK") {
        throw new Error(
          "Stock changed while you were checking out. Please review your cart.",
        );
      }
      throw new Error("The order could not be saved. Please try again.");
    }

    return {
      orderId: appOrderId,
      orderNumber,
      razorpayOrderId,
      amount,
      currency: "INR",
      keyId: credentials.keyId,
    };
  });

export const verifyCheckoutPayment = createServerFn({ method: "POST" })
  .middleware([optionalAuthMiddleware])
  .validator((input: unknown) => verifySchema.parse(input))
  .handler(async ({ data }): Promise<OrderConfirmation> => {
    const credentials = getRazorpayCredentials();
    if (!credentials) {
      throw new Error("Razorpay payment verification is not configured.");
    }
    const sql = await getSql();
    const orders = await sql.query<{
      id: string;
      order_number: string;
      customer_name: string;
      customer_email: string;
      shipping_address: ShippingAddress | string;
      subtotal: string | number;
      shipping: string | number;
      total: string | number;
      payment_status: Order["paymentStatus"];
      status: Order["status"];
      created_at: string | Date;
      razorpay_order_id: string | null;
      razorpay_payment_id: string | null;
    }>("select * from uv_orders where id = $1 limit 1", [data.orderId]);
    const order = orders[0];
    if (!order || order.razorpay_order_id !== data.razorpayOrderId) {
      throw new Error("Order not found.");
    }
    if (
      !verifyRazorpaySignature(
        credentials.keySecret,
        data.razorpayOrderId,
        data.razorpayPaymentId,
        data.razorpaySignature,
      )
    ) {
      throw new Error("Payment signature is invalid.");
    }

    if (order.payment_status === "paid") {
      if (order.razorpay_payment_id !== data.razorpayPaymentId) {
        throw new Error("This order has already been paid with a different payment.");
      }
      const [confirmed] = await hydrateOrders(sql, [order]);
      return { order: confirmed, paymentStatus: "paid" };
    }
    if (order.status === "cancelled") {
      throw new Error(
        "This checkout session expired. Contact the store for payment assistance.",
      );
    }

    try {
      await withTransaction(async (tx) => {
        const locked = await tx.query<{ payment_status: string }>(
          "select payment_status from uv_orders where id = $1 for update",
          [order.id],
        );
        if (!locked[0] || locked[0].payment_status !== "pending") {
          throw new Error("ORDER_ALREADY_PROCESSED");
        }
        const lines = await tx.query<{ product_id: string | null; quantity: number }>(
          "select product_id, quantity from uv_order_items where order_id = $1",
          [order.id],
        );
        const quantityByProduct = new Map<string, number>();
        for (const line of lines) {
          if (line.product_id) {
            quantityByProduct.set(
              line.product_id,
              (quantityByProduct.get(line.product_id) ?? 0) + Number(line.quantity),
            );
          }
        }
        for (const [productId, quantity] of quantityByProduct) {
          const updated = await tx.query<{ product_id: string }>(
            `update uv_inventory
             set stock = stock - $2, reserved = greatest(reserved - $2, 0), updated_at = now()
             where product_id = $1 and stock >= $2
             returning product_id`,
            [productId, quantity],
          );
          if (!updated[0]) throw new Error("STOCK_RESERVATION_MISSING");
        }
        const saved = await tx.query<{ id: string }>(
          `update uv_orders
           set payment_status = 'paid', status = 'paid', razorpay_payment_id = $2, updated_at = now()
           where id = $1
           returning id`,
          [order.id, data.razorpayPaymentId],
        );
        if (!saved[0]) throw new Error("ORDER_NOT_FOUND");
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "ORDER_ALREADY_PROCESSED" ||
          error.message === "STOCK_RESERVATION_MISSING")
      ) {
        throw new Error(
          "Payment was received but the order needs store support. Please contact UV with your order number.",
        );
      }
      throw new Error(
        "Payment was verified but the order could not be finalized. Contact the store with your order number.",
      );
    }

    const paid = await sql.query<(typeof orders)[number]>(
      "select * from uv_orders where id = $1 limit 1",
      [order.id],
    );
    const [confirmed] = await hydrateOrders(sql, paid);
    if (!confirmed) {
      throw new Error("Payment was verified but order details could not be loaded.");
    }
    return { order: confirmed, paymentStatus: "paid" };
  });

export const listAccountOrders = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .handler(async ({ context }): Promise<Order[]> => {
    if (!context.userId) throw new Error("Sign in to continue.");
    const sql = await getSql();
    const rows = await sql.query<Parameters<typeof hydrateOrders>[1][number]>(
      "select * from uv_orders where customer_id = $1 order by created_at desc",
      [context.userId],
    );
    return hydrateOrders(sql, rows);
  });
