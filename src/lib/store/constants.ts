export const FREE_SHIPPING_THRESHOLD = 2500;
export const STANDARD_SHIPPING = 99;
export const RESERVATION_MINUTES = 30;
export const CART_STORAGE_KEY = "uv-store-cart-v1";
export const CONFIRMATION_STORAGE_KEY = "uv-confirmation";

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const FULFILMENT_UPDATES = [
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
