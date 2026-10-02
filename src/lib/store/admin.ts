import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, withTransaction } from "@/lib/db";
import { hydrateOrders, hydrateProducts, productSelect } from "./hydrate";
import { slugify } from "./money";
import { requireAdmin, ensureProfile } from "./profiles";
import type {
  AdminDashboard,
  InventoryItem,
  Order,
  OrderStatus,
  Product,
  ProductInput,
  StoreProfile,
} from "./types";

const imageSchema = z.object({ url: z.string().min(1), alt: z.string() });
const productInputSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).nullable().optional(),
  category: z.string().min(1),
  images: z.array(imageSchema),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
  stock: z.number().int().min(0),
  sku: z.string().min(1),
  featured: z.boolean(),
  newArrival: z.boolean(),
  published: z.boolean(),
});

async function getProductView(productId: string): Promise<Product | null> {
  const sql = await getSql();
  const rows = await sql.query<Parameters<typeof hydrateProducts>[1][number]>(
    `select ${productSelect}
     from uv_products p
     inner join uv_categories c on c.id = p.category_id
     inner join uv_inventory i on i.product_id = p.id
     where p.id = $1
     limit 1`,
    [productId],
  );
  const [product] = await hydrateProducts(sql, rows);
  return product ?? null;
}

async function saveProduct(productId: string | undefined, input: ProductInput) {
  const slug = slugify(input.slug);
  if (!slug) throw new Error("INVALID_SLUG");
  const categorySlug = slugify(input.category);
  if (!categorySlug) throw new Error("INVALID_CATEGORY");

  return withTransaction(async (sql) => {
    const existingCategory = await sql.query<{ id: string }>(
      "select id from uv_categories where slug = $1 limit 1",
      [categorySlug],
    );
    let categoryId = existingCategory[0]?.id;
    if (categoryId) {
      await sql.query("update uv_categories set name = $2 where id = $1", [
        categoryId,
        input.category.trim(),
      ]);
    } else {
      categoryId = randomUUID();
      await sql.query(
        "insert into uv_categories (id, name, slug) values ($1, $2, $3)",
        [categoryId, input.category.trim(), categorySlug],
      );
    }

    const values = [
      categoryId,
      input.name.trim(),
      slug,
      input.description,
      String(input.price),
      input.compareAtPrice === null || input.compareAtPrice === undefined
        ? null
        : String(input.compareAtPrice),
      input.sku.trim(),
      input.sizes,
      input.colors,
      input.featured,
      input.newArrival,
      input.published,
    ];

    let savedId = productId;
    if (productId) {
      const updated = await sql.query<{ id: string }>(
        `update uv_products set
          category_id = $2, name = $3, slug = $4, description = $5, price = $6,
          compare_at_price = $7, sku = $8, sizes = $9::text[], colors = $10::text[],
          featured = $11, new_arrival = $12, published = $13, updated_at = now()
         where id = $1
         returning id`,
        [productId, ...values],
      );
      if (!updated[0]) throw new Error("PRODUCT_NOT_FOUND");
      savedId = updated[0].id;
      const stockUpdated = await sql.query<{ product_id: string }>(
        `update uv_inventory
         set stock = $2 + reserved, updated_at = now()
         where product_id = $1
         returning product_id`,
        [savedId, input.stock],
      );
      if (!stockUpdated[0]) throw new Error("STOCK_RESERVED");
      await sql.query("delete from uv_product_images where product_id = $1", [savedId]);
    } else {
      savedId = randomUUID();
      await sql.query(
        `insert into uv_products (
          id, category_id, name, slug, description, price, compare_at_price, sku,
          sizes, colors, featured, new_arrival, published
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9::text[],$10::text[],$11,$12,$13)`,
        [savedId, ...values],
      );
      await sql.query(
        "insert into uv_inventory (product_id, stock) values ($1, $2)",
        [savedId, input.stock],
      );
    }

    if (input.images.length > 0) {
      for (const [position, image] of input.images.entries()) {
        await sql.query(
          "insert into uv_product_images (product_id, url, alt, position) values ($1,$2,$3,$4)",
          [savedId, image.url, image.alt, position],
        );
      }
    }
    return savedId!;
  });
}

export const getStoreProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<StoreProfile> => {
    return ensureProfile(context.userId, null);
  });

export const getAdminDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AdminDashboard> => {
    await requireAdmin(context.userId, null);
    const sql = await getSql();
    const [ordersCount, revenue, productsCount, lowStockRows, recentRows] =
      await Promise.all([
        sql.query<{ value: number }>("select count(*)::int as value from uv_orders"),
        sql.query<{ value: string }>(
          "select coalesce(sum(total), 0)::text as value from uv_orders where payment_status = 'paid'",
        ),
        sql.query<{ value: number }>("select count(*)::int as value from uv_products"),
        sql.query<{ stock: number; reserved: number; threshold: number }>(
          "select stock, reserved, low_stock_threshold as threshold from uv_inventory",
        ),
        sql.query<Parameters<typeof hydrateOrders>[1][number]>(
          "select * from uv_orders order by created_at desc limit 5",
        ),
      ]);
    const lowStockCount = lowStockRows.filter(
      (item) => Number(item.stock) - Number(item.reserved) <= Number(item.threshold),
    ).length;
    return {
      totalOrders: ordersCount[0]?.value ?? 0,
      totalRevenue: Number(revenue[0]?.value ?? 0),
      productCount: productsCount[0]?.value ?? 0,
      lowStockCount,
      recentOrders: await hydrateOrders(sql, recentRows),
    };
  });

export const listAdminProducts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Product[]> => {
    await requireAdmin(context.userId, null);
    const sql = await getSql();
    const rows = await sql.query<Parameters<typeof hydrateProducts>[1][number]>(
      `select ${productSelect}
       from uv_products p
       inner join uv_categories c on c.id = p.category_id
       inner join uv_inventory i on i.product_id = p.id
       order by p.created_at desc`,
    );
    return hydrateProducts(sql, rows);
  });

export const createProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => productInputSchema.parse(input))
  .handler(async ({ data, context }): Promise<Product> => {
    await requireAdmin(context.userId, null);
    try {
      const productId = await saveProduct(undefined, data);
      const product = await getProductView(productId);
      if (!product) throw new Error("The product was created but could not be loaded.");
      return product;
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_SLUG") {
        throw new Error("Enter a valid product URL slug.");
      }
      if (error instanceof Error && error.message === "INVALID_CATEGORY") {
        throw new Error("Enter a valid product category.");
      }
      throw new Error("A product with this slug or SKU already exists.");
    }
  });

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ productId: z.string().min(1), data: productInputSchema }).parse(input),
  )
  .handler(async ({ data, context }): Promise<Product> => {
    await requireAdmin(context.userId, null);
    try {
      await saveProduct(data.productId, data.data);
      const product = await getProductView(data.productId);
      if (!product) throw new Error("Product not found.");
      return product;
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        throw new Error("Product not found.");
      }
      if (error instanceof Error && error.message === "STOCK_RESERVED") {
        throw new Error(
          "Stock cannot be lower than the quantity reserved for pending checkouts.",
        );
      }
      if (error instanceof Error && error.message === "Product not found.") throw error;
      throw new Error("Product details conflict with an existing slug or SKU.");
    }
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ productId: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await requireAdmin(context.userId, null);
    const sql = await getSql();
    const pending = await sql.query<{ id: number }>(
      `select oi.id from uv_order_items oi
       inner join uv_orders o on o.id = oi.order_id
       where oi.product_id = $1 and o.status = 'pending'
       limit 1`,
      [data.productId],
    );
    if (pending.length > 0) {
      throw new Error("This product has an active checkout. Hide it until that checkout expires.");
    }
    const deleted = await sql.query<{ id: string }>(
      "delete from uv_products where id = $1 returning id",
      [data.productId],
    );
    if (!deleted[0]) throw new Error("Product not found.");
    return { ok: true };
  });

export const listInventory = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<InventoryItem[]> => {
    await requireAdmin(context.userId, null);
    const sql = await getSql();
    const rows = await sql.query<{
      product_id: string;
      product_name: string;
      sku: string;
      stock: number;
      reserved: number;
      threshold: number;
    }>(
      `select p.id as product_id, p.name as product_name, p.sku, i.stock, i.reserved,
              i.low_stock_threshold as threshold
       from uv_inventory i
       inner join uv_products p on p.id = i.product_id
       order by p.name asc`,
    );
    return rows.map((row) => ({
      productId: row.product_id,
      productName: row.product_name,
      sku: row.sku,
      stock: Math.max(0, Number(row.stock) - Number(row.reserved)),
      lowStock: Number(row.stock) - Number(row.reserved) <= Number(row.threshold),
    }));
  });

export const updateInventory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ productId: z.string().min(1), stock: z.number().int().min(0) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<InventoryItem> => {
    await requireAdmin(context.userId, null);
    const sql = await getSql();
    const updated = await sql.query<{
      product_id: string;
      stock: number;
      reserved: number;
      threshold: number;
    }>(
      `update uv_inventory
       set stock = $2 + reserved, updated_at = now()
       where product_id = $1
       returning product_id, stock, reserved, low_stock_threshold as threshold`,
      [data.productId, data.stock],
    );
    if (!updated[0]) throw new Error("Inventory record not found.");
    const product = await sql.query<{ product_name: string; sku: string }>(
      "select name as product_name, sku from uv_products where id = $1",
      [updated[0].product_id],
    );
    return {
      productId: updated[0].product_id,
      productName: product[0]?.product_name ?? "",
      sku: product[0]?.sku ?? "",
      stock: Math.max(0, Number(updated[0].stock) - Number(updated[0].reserved)),
      lowStock:
        Number(updated[0].stock) - Number(updated[0].reserved) <=
        Number(updated[0].threshold),
    };
  });

export const listAdminOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { status?: OrderStatus } | undefined) =>
    z.object({ status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled"]).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }): Promise<Order[]> => {
    await requireAdmin(context.userId, null);
    const sql = await getSql();
    const rows = data.status
      ? await sql.query<Parameters<typeof hydrateOrders>[1][number]>(
          "select * from uv_orders where status = $1 order by created_at desc",
          [data.status],
        )
      : await sql.query<Parameters<typeof hydrateOrders>[1][number]>(
          "select * from uv_orders order by created_at desc",
        );
    return hydrateOrders(sql, rows);
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        orderId: z.string().min(1),
        status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<Order> => {
    await requireAdmin(context.userId, null);
    const sql = await getSql();
    const rows = await sql.query<Parameters<typeof hydrateOrders>[1][number]>(
      "update uv_orders set status = $2, updated_at = now() where id = $1 returning *",
      [data.orderId, data.status],
    );
    if (!rows[0]) throw new Error("Order not found.");
    const [view] = await hydrateOrders(sql, rows);
    return view;
  });
