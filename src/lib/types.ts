// ─────────────────────────────────────────────────────────────
//  Book Worm – Core Domain Types
// ─────────────────────────────────────────────────────────────

// ── Enums ──────────────────────────────────────────────────────
export type UserRole = "GUEST" | "REGISTERED" | "ADMIN";

export type BookFormat = "Paperback" | "Hardcover" | "eBook";

export type BookCategory =
  | "Self-help"
  | "Fiction"
  | "Romance"
  | "Mystery"
  | "Science Fiction"
  | "Biography"
  | "Memoir"
  | "Philosophy"
  | "History"
  | "Children"
  | "Fantasy"
  | "Thriller"
  | "New Launch"
  | "Cooking"
  | "Travel";

export type OrderStatus = "CONFIRMED" | "CANCELLED" | "DELIVERED";

export type PaymentMethod =
  | "Credit Card"
  | "Debit Card"
  | "UPI"
  | "Net Banking"
  | "Gift Points"
  | "Cash on Delivery";

// ── Address ────────────────────────────────────────────────────
export interface Address {
  id: string;
  label: string; // e.g. "Home", "Office"
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// ── User / Member ──────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  savedAddresses: Address[];
  giftPointsBalance: number; // default 500
  createdAt: Date;
}

// ── Author ─────────────────────────────────────────────────────
export interface Author {
  name: string;
  bio: string;
  imageUrl: string;
}

// ── Book / Catalog ─────────────────────────────────────────────
export interface Book {
  id: string;
  title: string;
  author: string;
  authorBio: string;
  authorImage: string;
  publisher: string;
  format: BookFormat;
  category: BookCategory;
  /** Price in Indian Rupees (₹) */
  price: number;
  /** Original / MRP price before discount */
  originalPrice?: number;
  rating: number; // 1.0 – 5.0
  reviewCount: number;
  copiesSold: number;
  coverImage: string;
  /** e.g. "3-5 days" */
  tentativeDeliveryDays: string;
  isBestseller: boolean;
  isNewLaunch: boolean;
  isRecommended: boolean;
  description: string;
  pages?: number;
  language?: string;
  isbn?: string;
  publishedDate?: string;
}

// ── Review ─────────────────────────────────────────────────────
export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number; // 1–5
  comment: string;
  createdAt: Date;
}

// ── Cart ───────────────────────────────────────────────────────
export interface CartItem {
  bookId: string;
  quantity: number;
  selectedFormat: BookFormat;
  /** Snapshot of price at time of adding */
  priceAtAdd: number;
}

// ── Order ──────────────────────────────────────────────────────
export interface OrderItem extends CartItem {
  title: string;
  coverImage: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  address: Address;
  subtotal: number;
  tax: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  /** createdAt + 48 hours – after this point cancellation is not allowed */
  canCancelUntil: Date;
}

// ── Coupon ─────────────────────────────────────────────────────
export interface Coupon {
  code: string;
  discountAmount: number;
  minOrderValue: number;
  description?: string;
}

// ─────────────────────────────────────────────────────────────
//  Store / State Slice types (consumed by Zustand)
// ─────────────────────────────────────────────────────────────

export interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  addItem: (item: CartItem) => void;
  removeItem: (bookId: string, format: BookFormat) => void;
  updateQuantity: (bookId: string, format: BookFormat, quantity: number) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  /** Derived helpers */
  subtotal: () => number;
  totalItems: () => number;
}

export interface CheckoutState {
  selectedAddress: Address | null;
  paymentMethod: PaymentMethod | null;
  useGiftPoints: boolean;
  setSelectedAddress: (address: Address) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  toggleGiftPoints: () => void;
  reset: () => void;
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateGiftPoints: (delta: number) => void;
  addAddress: (address: Address) => void;
  removeAddress: (addressId: string) => void;
}
