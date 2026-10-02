import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { hydrateProducts, productSelect } from "./hydrate";
import type { Collection, Product, ProductFilters, ProductPage } from "./types";

const filtersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sort: z.enum(["featured", "newest", "price-asc", "price-desc"]).optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(48).optional(),
});

export const listProducts = createServerFn({ method: "GET" })
  .validator((input: ProductFilters) => filtersSchema.parse(input ?? {}))
  .handler(async ({ data }): Promise<ProductPage> => {
    const sql = await getSql();
    const page = data.page ?? 1;
    const pageSize = data.pageSize ?? 12;
    const clauses = ["p.published = true"];
    const params: unknown[] = [];
    const add = (clause: string, value: unknown) => {
      params.push(value);
      clauses.push(clause.replace("?", `$${params.length}`));
    };
    if (data.category) add("c.slug = ?", data.category);
    if (data.size) add("? = any(p.sizes)", data.size);
    if (data.color) add("? = any(p.colors)", data.color);
    if (data.minPrice !== undefined) add("p.price::numeric >= ?", data.minPrice);
    if (data.maxPrice !== undefined) add("p.price::numeric <= ?", data.maxPrice);
    if (data.search) {
      const q = `%${data.search}%`;
      params.push(q, q, q);
      const a = params.length - 2;
      const b = params.length - 1;
      const c = params.length;
      clauses.push(`(p.name ilike $${a} or p.sku ilike $${b} or c.name ilike $${c})`);
    }
    const where = clauses.join(" and ");
    const orderBy =
      data.sort === "price-asc"
        ? "p.price asc"
        : data.sort === "price-desc"
          ? "p.price desc"
          : data.sort === "newest"
            ? "p.created_at desc"
            : "p.featured desc, p.created_at desc";
    const offset = (page - 1) * pageSize;
    const countParams = [...params];
    params.push(pageSize, offset);
    const limitIdx = params.length - 1;
    const offsetIdx = params.length;
    const rows = await sql.query<Parameters<typeof hydrateProducts>[1][number]>(
      `select ${productSelect}
       from uv_products p
       inner join uv_categories c on c.id = p.category_id
       inner join uv_inventory i on i.product_id = p.id
       where ${where}
       order by ${orderBy}
       limit $${limitIdx} offset $${offsetIdx}`,
      params,
    );
    const totalRows = await sql.query<{ value: number }>(
      `select count(*)::int as value
       from uv_products p
       inner join uv_categories c on c.id = p.category_id
       inner join uv_inventory i on i.product_id = p.id
       where ${where}`,
      countParams,
    );
    return {
      items: await hydrateProducts(sql, rows),
      total: totalRows[0]?.value ?? 0,
      page,
      pageSize,
    };
  });

export const getProduct = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<Product> => {
    const sql = await getSql();
    const rows = await sql.query<Parameters<typeof hydrateProducts>[1][number]>(
      `select ${productSelect}
       from uv_products p
       inner join uv_categories c on c.id = p.category_id
       inner join uv_inventory i on i.product_id = p.id
       where p.slug = $1 and p.published = true
       limit 1`,
      [data.slug],
    );
    const [product] = await hydrateProducts(sql, rows);
    if (!product) throw new Error("Product not found.");
    return product;
  });

export const listCollections = createServerFn({ method: "GET" }).handler(
  async (): Promise<Collection[]> => {
    const sql = await getSql();
    const rows = await sql.query<{
      name: string;
      slug: string;
      product_count: number;
    }>(
      `select c.name, c.slug, count(p.id)::int as product_count
       from uv_categories c
       inner join uv_products p on p.category_id = c.id
       where p.published = true
       group by c.id, c.name, c.slug
       order by c.name asc`,
    );
    return rows.map((row) => ({
      name: row.name,
      slug: row.slug,
      productCount: Number(row.product_count),
      image: null,
    }));
  },
);
