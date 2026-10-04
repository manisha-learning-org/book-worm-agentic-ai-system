import { REAL_BOOKS } from "@/lib/mock-data";

export interface OrderItem {
  bookId: string;
  title: string;
  author: string;
  format: "Paperback" | "Hardcover" | "eBook";
  price: number;
  quantity: number;
  coverImage: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  status: "CONFIRMED" | "DELIVERED" | "CANCELLED";
  paymentMethod: "UPI" | "Card" | "Net Banking" | "Wallet";
  deliveryAddress: {
    city: string;
    state: string;
  };
  createdAt: string; // ISO string
}

export const INITIAL_ORDERS: Order[] = [
  {
    id: "order-001",
    items: [
      {
        bookId: "psychology-of-money",
        title: "The Psychology of Money",
        author: "Morgan Housel",
        format: "Paperback",
        price: 349,
        quantity: 1,
        coverImage: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
      },
      {
        bookId: "silent-patient",
        title: "The Silent Patient",
        author: "Alex Michaelides",
        format: "Paperback",
        price: 329,
        quantity: 1,
        coverImage: "https://covers.openlibrary.org/b/isbn/9781409181637-L.jpg",
      },
    ],
    subtotal: 678,
    tax: 34,
    deliveryCharge: 0,
    discount: 0,
    totalAmount: 712,
    status: "DELIVERED",
    paymentMethod: "UPI",
    deliveryAddress: {
      city: "Bengaluru",
      state: "Karnataka",
    },
    // Created 5 days ago (delivered & cancellation window closed)
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
