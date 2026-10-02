import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env.server";

export function getRazorpayCredentials():
  | { keyId: string; keySecret: string }
  | undefined {
  const keyId = env("RAZORPAY_KEY_ID");
  const keySecret = env("RAZORPAY_KEY_SECRET");
  return keyId && keySecret ? { keyId, keySecret } : undefined;
}

export async function createRazorpayOrder(
  keyId: string,
  keySecret: string,
  appOrderId: string,
  orderNumber: string,
  amount: number,
): Promise<string> {
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: orderNumber,
      notes: { uv_order_id: appOrderId },
    }),
  });
  const payload = (await response.json()) as { id?: unknown; error?: unknown };
  if (!response.ok || typeof payload.id !== "string") {
    throw new Error("Payment provider could not create an order.");
  }
  return payload.id;
}

export function verifyRazorpaySignature(
  keySecret: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean {
  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest();
  let suppliedSignature: Buffer;
  try {
    suppliedSignature = Buffer.from(razorpaySignature, "hex");
  } catch {
    return false;
  }
  if (suppliedSignature.length !== expectedSignature.length) return false;
  return timingSafeEqual(suppliedSignature, expectedSignature);
}
