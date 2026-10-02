export type ProductImage = { url: string; alt: string };

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  images: ProductImage[];
  sizes: string[];
  colors: string[];
  stock: number;
  sku: string;
  featured: boolean;
  newArrival: boolean;
  published: boolean;
  createdAt: string;
};

export type ProductPage = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export type Collection = {
  name: string;
  slug: string;
  productCount: number;
  image: string | null;
};

export type CartLineInput = {
  productId: string;
  quantity: number;
  size: string;
  color: string;
};

export type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type CheckoutSession = {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: "INR";
  keyId: string;
};

export type PaymentVerificationInput = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type OrderLine = {
  productName: string;
  quantity: number;
  unitPrice: number;
  size: string;
  color: string;
  image: string | null;
};

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  createdAt: string;
};

export type OrderConfirmation = {
  order: Order;
  paymentStatus: "paid";
};

export type AdminDashboard = {
  totalOrders: number;
  totalRevenue: number;
  productCount: number;
  lowStockCount: number;
  recentOrders: Order[];
};

export type ProductInput = {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  category: string;
  images: ProductImage[];
  sizes: string[];
  colors: string[];
  stock: number;
  sku: string;
  featured: boolean;
  newArrival: boolean;
  published: boolean;
};

export type InventoryItem = {
  productId: string;
  productName: string;
  sku: string;
  stock: number;
  lowStock: boolean;
};

export type ProductSort = "featured" | "newest" | "price-asc" | "price-desc";

export type ProductFilters = {
  search?: string;
  category?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

export type StoreProfile = {
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
};
