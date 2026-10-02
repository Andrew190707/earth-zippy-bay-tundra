import { getSql } from "@/lib/db";
import type { StoreProfile } from "./types";

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "Store administrator access is required.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

function asBool(value: unknown) {
  return value === true || value === "t" || value === "true";
}

export async function ensureProfile(
  userId: string,
  email: string | null,
  fullName = "",
): Promise<StoreProfile> {
  const sql = await getSql();
  const safeEmail = (email ?? "").trim();
  const existing = await sql.query<{
    id: string;
    email: string;
    full_name: string;
    is_admin: unknown;
  }>("select id, email, full_name, is_admin from uv_profiles where id = $1 limit 1", [
    userId,
  ]);

  if (existing[0]) {
    await sql.query(
      "update uv_profiles set email = case when $2 = '' then email else $2 end, full_name = case when $3 = '' then full_name else $3 end where id = $1",
      [userId, safeEmail, fullName],
    );
    return {
      id: existing[0].id,
      email: safeEmail || existing[0].email,
      fullName: fullName || existing[0].full_name,
      isAdmin: asBool(existing[0].is_admin),
    };
  }

  const admins = await sql.query<{ n: number }>(
    "select count(*)::int as n from uv_profiles where is_admin = true",
  );
  const isAdmin = (admins[0]?.n ?? 0) === 0;
  const insertEmail = safeEmail || `${userId}@uv.local`;
  await sql.query(
    "insert into uv_profiles (id, email, full_name, is_admin) values ($1, $2, $3, $4)",
    [userId, insertEmail, fullName, isAdmin],
  );
  return { id: userId, email: insertEmail, fullName, isAdmin };
}

export async function requireAdmin(userId: string, email: string | null) {
  const profile = await ensureProfile(userId, email);
  if (!profile.isAdmin) throw new ForbiddenError();
  return profile;
}
