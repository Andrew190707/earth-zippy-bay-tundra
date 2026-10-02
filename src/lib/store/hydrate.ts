import type { Sql } from "@/lib/db";
import type { Order, Product, ShippingAddress } from "./types";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  compare_at_price: string | number | null;
  sku: string;
  sizes: string[] | null;
  colors: string[] | null;
  featured: unknown;
  new_arrival: unknown;
  published: unknown;
  created_at: string | Date;
  category_name: string;
  stock: number;
  reserved: number;
};

type OrderRow = {
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
};

function asBool(value: unknown) {
  return value === true || value === "t" || value === "true";
}

function asNumber(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

function asIso(value: string | Date) {
  return value instanceof Date ? value.toISOString() : String(value);
}

function asArray(value: string[] | null) {
  if (Array.isArray(value)) return value;
  return [];
}

export async function hydrateProducts(sql: Sql, rows: ProductRow[]): Promise<Product[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
  const images = await sql.query<{ product_id: string; url: string; alt: string }>(
    `select product_id, url, alt from uv_product_images where product_id in (${placeholders}) order by position asc, id asc`,
    ids,
  );
  const byProduct = new Map<string, { url: string; alt: string }[]>();
  for (const image of images) {
    const list = byProduct.get(image.product_id) ?? [];
    list.push({ url: image.url, alt: image.alt });
    byProduct.set(image.product_id, list);
  }
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: asNumber(row.price),
    compareAtPrice:
      row.compare_at_price === null || row.compare_at_price === undefined
        ? null
        : asNumber(row.compare_at_price),
    category: row.category_name,
    images: byProduct.get(row.id) ?? [],
    sizes: asArray(row.sizes),
    colors: asArray(row.colors),
    stock: Math.max(0, Number(row.stock) - Number(row.reserved)),
    sku: row.sku,
    featured: asBool(row.featured),
    newArrival: asBool(row.new_arrival),
    published: asBool(row.published),
    createdAt: asIso(row.created_at),
  }));
}

export async function hydrateOrders(sql: Sql, orders: OrderRow[]): Promise<Order[]> {
  if (orders.length === 0) return [];
  const ids = orders.map((order) => order.id);
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
  const items = await sql.query<{
    order_id: string;
    product_name: string;
    quantity: number;
    unit_price: string | number;
    size: string;
    color: string;
    image_url: string | null;
  }>(
    `select order_id, product_name, quantity, unit_price, size, color, image_url
     from uv_order_items where order_id in (${placeholders}) order by id asc`,
    ids,
  );
  const byOrder = new Map<string, typeof items>();
  for (const item of items) {
    const list = byOrder.get(item.order_id) ?? [];
    list.push(item);
    byOrder.set(item.order_id, list);
  }
  return orders.map((order) => {
    const address =
      typeof order.shipping_address === "string"
        ? (JSON.parse(order.shipping_address) as ShippingAddress)
        : order.shipping_address;
    return {
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      items: (byOrder.get(order.id) ?? []).map((item) => ({
        productName: item.product_name,
        quantity: Number(item.quantity),
        unitPrice: asNumber(item.unit_price),
        size: item.size,
        color: item.color,
        image: item.image_url,
      })),
      subtotal: asNumber(order.subtotal),
      shipping: asNumber(order.shipping),
      total: asNumber(order.total),
      paymentStatus: order.payment_status,
      status: order.status,
      shippingAddress: address,
      createdAt: asIso(order.created_at),
    };
  });
}

export const productSelect = `
  p.id, p.name, p.slug, p.description, p.price, p.compare_at_price, p.sku,
  p.sizes, p.colors, p.featured, p.new_arrival, p.published, p.created_at,
  c.name as category_name, i.stock, i.reserved
`;
