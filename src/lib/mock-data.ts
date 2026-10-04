// ─────────────────────────────────────────────────────────────
//  Book Worm – Mock In-Memory Data Store
//  All prices are in Indian Rupees (₹).
// ─────────────────────────────────────────────────────────────

import type {
  User,
  Book,
  Review,
  Coupon,
  Address,
  Order,
} from "@/lib/types";

// ── Helpers ────────────────────────────────────────────────────
function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

// ── Addresses ─────────────────────────────────────────────────
const sampleAddress: Address = {
  id: "addr-001",
  label: "Home",
  fullName: "Priya Sharma",
  phone: "9876543210",
  line1: "42, Elm Street",
  line2: "Koramangala 5th Block",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560095",
  country: "India",
};

// ── Default Registered User ────────────────────────────────────
export const mockUser: User = {
  id: "user-001",
  email: "priya.sharma@example.com",
  name: "Priya Sharma",
  role: "REGISTERED",
  savedAddresses: [sampleAddress],
  giftPointsBalance: 500,
  createdAt: new Date("2024-01-15T10:00:00Z"),
};

// ── Books ──────────────────────────────────────────────────────
export const mockBooks: Book[] = [
  // ── Self-help ─────────────────────────────────────────────
  {
    id: "atomic-habits",
    isbn: "9780735211292",
    title: "Atomic Habits",
    author: "James Clear",
    authorBio:
      "James Clear is an author and speaker focused on habits, decision-making, and continuous improvement. His work regularly appears in the New York Times and The Wall Street Journal.",
    authorImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    publisher: "Avery / Penguin Random House",
    category: "Self-help",
    format: "Paperback",
    price: 499,
    originalPrice: 799,
    rating: 4.8,
    reviewCount: 3420,
    copiesSold: 12500,
    coverImage: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
    tentativeDeliveryDays: "2-3 days",
    isBestseller: true,
    isNewLaunch: false,
    isRecommended: true,
    description:
      "An easy and proven way to build good habits and break bad ones. Learn how small changes can lead to remarkable results.",
    language: "English",
    publishedDate: "2018-10-16",
  },
  {
    id: "psychology-of-money",
    isbn: "9780857197689",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    authorBio:
      "Morgan Housel is a partner at The Collaborative Fund and a former columnist at The Motley Fool and The Wall Street Journal.",
    authorImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    publisher: "Harriman House",
    category: "Self-help",
    format: "Paperback",
    price: 349,
    originalPrice: 499,
    rating: 4.7,
    reviewCount: 2190,
    copiesSold: 8400,
    coverImage: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
    tentativeDeliveryDays: "2-3 days",
    isBestseller: true,
    isNewLaunch: false,
    isRecommended: true,
    description:
      "Doing well with money isn't necessarily about what you know. It's about how you behave. Timeless lessons on wealth, greed, and happiness.",
    language: "English",
    publishedDate: "2020-09-08",
  },
  {
    id: "deep-work",
    isbn: "9781455586691",
    title: "Deep Work",
    author: "Cal Newport",
    authorBio:
      "Cal Newport is an Associate Professor of Computer Science at Georgetown University and the author of multiple bestsellers on focus and intentional technology.",
    authorImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    publisher: "Grand Central Publishing",
    category: "Self-help",
    format: "Paperback",
    price: 399,
    originalPrice: 599,
    rating: 4.6,
    reviewCount: 1420,
    copiesSold: 5600,
    coverImage: "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg",
    tentativeDeliveryDays: "3-5 days",
    isBestseller: false,
    isNewLaunch: false,
    isRecommended: true,
    description:
      "Rules for focused success in a distracted world. Deep work is the superpower of our competitive modern economy.",
    language: "English",
    publishedDate: "2016-01-05",
  },

  // ── Philosophy ────────────────────────────────────────────
  {
    id: "thinking-fast-and-slow",
    isbn: "9780374533557",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    authorBio:
      "Daniel Kahneman was an Israeli-American psychologist recognized for his work in behavioral economics, receiving the Nobel Memorial Prize in Economic Sciences in 2002.",
    authorImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
    publisher: "Farrar, Straus and Giroux",
    category: "Philosophy",
    format: "Paperback",
    price: 449,
    originalPrice: 650,
    rating: 4.5,
    reviewCount: 1980,
    copiesSold: 7100,
    coverImage: "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg",
    tentativeDeliveryDays: "3-5 days",
    isBestseller: false,
    isNewLaunch: false,
    isRecommended: false,
    description:
      "A tour of the mind explaining the two systems that drive our choices: fast, intuitive thinking, and slow, deliberate reasoning.",
    language: "English",
    publishedDate: "2011-10-25",
  },

  // ── Mystery ───────────────────────────────────────────────
  {
    id: "silent-patient",
    isbn: "9781409181637",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    authorBio:
      "Alex Michaelides is a British-Cypriot author and screenwriter who holds an M.A. in English Literature from Cambridge University.",
    authorImage:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
    publisher: "Celadon Books / Orion",
    category: "Mystery",
    format: "Paperback",
    price: 329,
    originalPrice: 499,
    rating: 4.6,
    reviewCount: 4210,
    copiesSold: 11000,
    coverImage: "https://covers.openlibrary.org/b/isbn/9781409181637-L.jpg",
    tentativeDeliveryDays: "2-3 days",
    isBestseller: true,
    isNewLaunch: false,
    isRecommended: true,
    description:
      "Alicia Berenson's life is seemingly perfect. One evening she shoots her husband five times and refuses to speak a single word ever again.",
    language: "English",
    publishedDate: "2019-02-05",
  },
  {
    id: "da-vinci-code",
    isbn: "9780307474278",
    title: "The Da Vinci Code",
    author: "Dan Brown",
    authorBio:
      "Dan Brown is the author of numerous internationally bestselling thrillers, including Angels & Demons and Inferno.",
    authorImage:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    publisher: "Anchor",
    category: "Mystery",
    format: "Paperback",
    price: 299,
    originalPrice: 450,
    rating: 4.4,
    reviewCount: 5200,
    copiesSold: 18000,
    coverImage: "https://covers.openlibrary.org/b/isbn/9780307474278-L.jpg",
    tentativeDeliveryDays: "3-5 days",
    isBestseller: false,
    isNewLaunch: false,
    isRecommended: false,
    description:
      "While in Paris, Harvard symbologist Robert Langdon receives an urgent midnight call: the elderly curator of the Louvre has been murdered.",
    language: "English",
    publishedDate: "2004-03-28",
  },

  // ── Fantasy ───────────────────────────────────────────────
  {
    id: "midnight-library",
    isbn: "9780525559474",
    title: "The Midnight Library",
    author: "Matt Haig",
    authorBio:
      "Matt Haig is the number-one bestselling author of Reasons to Stay Alive, Notes on a Nervous Planet, and several acclaimed speculative fiction novels.",
    authorImage:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80",
    publisher: "Viking",
    category: "Fantasy",
    format: "Hardcover",
    price: 399,
    originalPrice: 599,
    rating: 4.5,
    reviewCount: 3100,
    copiesSold: 9300,
    coverImage: "https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg",
    tentativeDeliveryDays: "3-5 days",
    isBestseller: false,
    isNewLaunch: false,
    isRecommended: true,
    description:
      "Between life and death there is a library where every book gives you a chance to try another life you could have lived.",
    language: "English",
    publishedDate: "2020-08-13",
  },

  // ── Science Fiction ───────────────────────────────────────
  {
    id: "dune",
    isbn: "9780441172719",
    title: "Dune",
    author: "Frank Herbert",
    authorBio:
      "Frank Herbert was an American science-fiction master best known for his 1965 world-building masterpiece Dune and its subsequent epic saga.",
    authorImage:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
    publisher: "Ace Books",
    category: "Science Fiction",
    format: "Paperback",
    price: 499,
    originalPrice: 699,
    rating: 4.7,
    reviewCount: 6800,
    copiesSold: 14500,
    coverImage: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
    tentativeDeliveryDays: "2-3 days",
    isBestseller: true,
    isNewLaunch: false,
    isRecommended: true,
    description:
      "Set on the desert planet Arrakis, Dune tells the story of Paul Atreides as he navigates political betrayal and religious destiny across the sands.",
    language: "English",
    publishedDate: "1965-08-01",
  },
  {
    id: "project-hail-mary",
    isbn: "9780593135204",
    title: "Project Hail Mary",
    author: "Andy Weir",
    authorBio:
      "Andy Weir was a software engineer until the worldwide acclaim of The Martian allowed him to write speculative hard sci-fi full-time.",
    authorImage:
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80",
    publisher: "Ballantine Books",
    category: "Science Fiction",
    format: "Hardcover",
    price: 450,
    originalPrice: 650,
    rating: 4.9,
    reviewCount: 2890,
    copiesSold: 6700,
    coverImage: "https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg",
    tentativeDeliveryDays: "3-5 days",
    isBestseller: true,
    isNewLaunch: true,
    isRecommended: true,
    description:
      "Ryland Grace is the lone survivor on a desperate scientific mission—and if he fails, humanity and Earth itself will perish.",
    language: "English",
    publishedDate: "2021-05-04",
  },
  {
    id: "1984",
    isbn: "9780451524935",
    title: "1984",
    author: "George Orwell",
    authorBio:
      "George Orwell was the pen name of Eric Arthur Blair, an English novelist, essayist, and critic famed for animal political allegories and dystopian realism.",
    authorImage:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=300&q=80",
    publisher: "Signet Classic",
    category: "Science Fiction",
    format: "Paperback",
    price: 199,
    originalPrice: 299,
    rating: 4.7,
    reviewCount: 8400,
    copiesSold: 25000,
    coverImage: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
    tentativeDeliveryDays: "2-3 days",
    isBestseller: false,
    isNewLaunch: false,
    isRecommended: false,
    description:
      "Winston Smith lives in an oppressive surveillance state governed by Big Brother, rewriting historical archives to maintain infallible authority.",
    language: "English",
    publishedDate: "1949-06-08",
  },

  // ── Biography ─────────────────────────────────────────────
  {
    id: "sapiens",
    isbn: "9780062316097",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    authorBio:
      "Yuval Noah Harari is a historian, philosopher, and bestselling author whose books explore evolutionary biology, global macro-history, and future tech.",
    authorImage:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
    publisher: "Harper",
    category: "Biography",
    format: "Paperback",
    price: 499,
    originalPrice: 699,
    rating: 4.7,
    reviewCount: 7120,
    copiesSold: 16000,
    coverImage: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
    tentativeDeliveryDays: "3-5 days",
    isBestseller: true,
    isNewLaunch: false,
    isRecommended: true,
    description:
      "One hundred thousand years ago, at least six human species walked the earth. Today there is only one. Sapiens recounts how we inherited the globe.",
    language: "English",
    publishedDate: "2015-02-10",
  },

  // ── Memoir ────────────────────────────────────────────────
  {
    id: "shoe-dog",
    isbn: "9781501135910",
    title: "Shoe Dog",
    author: "Phil Knight",
    authorBio:
      "Phil Knight is the co-founder of Nike, Inc., and served as its longtime CEO and board chairman.",
    authorImage:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80",
    publisher: "Scribner",
    category: "Memoir",
    format: "Paperback",
    price: 420,
    originalPrice: 599,
    rating: 4.8,
    reviewCount: 2300,
    copiesSold: 8900,
    coverImage: "https://covers.openlibrary.org/b/isbn/9781501135910-L.jpg",
    tentativeDeliveryDays: "3-5 days",
    isBestseller: false,
    isNewLaunch: true,
    isRecommended: false,
    description:
      "Nike founder Phil Knight shares the inside account of the company's early days as an underdog start-up and its evolution into a global sportswear titan.",
    language: "English",
    publishedDate: "2016-04-26",
  },

  // ── Romance ───────────────────────────────────────────────
  {
    id: "the-alchemist",
    isbn: "9780062315007",
    title: "The Alchemist",
    author: "Paulo Coelho",
    authorBio:
      "Paulo Coelho is an internationally acclaimed Brazilian lyricist and novelist whose books have sold hundreds of millions of copies worldwide.",
    authorImage:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=300&q=80",
    publisher: "HarperOne",
    category: "Romance",
    format: "Paperback",
    price: 250,
    originalPrice: 399,
    rating: 4.6,
    reviewCount: 9400,
    copiesSold: 32000,
    coverImage: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
    tentativeDeliveryDays: "2-3 days",
    isBestseller: true,
    isNewLaunch: false,
    isRecommended: true,
    description:
      "The mystical story of Santiago, an Andalusian shepherd boy who journeys toward the Egyptian pyramids in pursuit of his personal treasure.",
    language: "English",
    publishedDate: "1993-04-25",
  },
  {
    id: "it-ends-with-us",
    isbn: "9781501110368",
    title: "It Ends with Us",
    author: "Colleen Hoover",
    authorBio:
      "Colleen Hoover is the #1 New York Times bestselling author of contemporary romance and psychological drama novels.",
    authorImage:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    publisher: "Atria Books",
    category: "Romance",
    format: "Paperback",
    price: 349,
    originalPrice: 499,
    rating: 4.5,
    reviewCount: 5800,
    copiesSold: 14000,
    coverImage: "https://covers.openlibrary.org/b/isbn/9781501110368-L.jpg",
    tentativeDeliveryDays: "2-3 days",
    isBestseller: false,
    isNewLaunch: true,
    isRecommended: false,
    description:
      "Lily hasn't always had it easy, but that's never stopped her from working hard for the life she envisions. A moving story of resilience and love.",
    language: "English",
    publishedDate: "2016-08-02",
  },
  {
    id: "pride-and-prejudice",
    isbn: "9780141439518",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    authorBio:
      "Jane Austen was an English novelist of the late 18th and early 19th centuries whose works of romantic fiction set among the landed gentry have earned her a place as one of the most widely read writers in English literature.",
    authorImage:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
    publisher: "Penguin Classics",
    category: "Romance",
    format: "Paperback",
    price: 199,
    originalPrice: 299,
    rating: 4.8,
    reviewCount: 12300,
    copiesSold: 45000,
    coverImage: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
    tentativeDeliveryDays: "2-3 days",
    isBestseller: true,
    isNewLaunch: false,
    isRecommended: false,
    description:
      "The story of the Bennet family and the spirited Elizabeth Bennet's relationship with the proud Mr. Darcy — a timeless tale of love, wit, and social manners.",
    language: "English",
    publishedDate: "1813-01-28",
  },
];

// REAL_BOOKS is an alias for consumers that prefer the new export name
export const REAL_BOOKS = mockBooks;

// ── Reviews ────────────────────────────────────────────────────
export const mockReviews: Review[] = [
  {
    id: "rev-001",
    bookId: "atomic-habits",
    userId: "user-001",
    userName: "Priya Sharma",
    rating: 5,
    comment:
      "This book completely changed how I think about building routines. The 1% better every day idea is genuinely life-changing.",
    createdAt: new Date("2024-03-12T08:30:00Z"),
  },
  {
    id: "rev-002",
    bookId: "atomic-habits",
    userId: "user-guest-1",
    userName: "Amit K.",
    rating: 4,
    comment:
      "Practical and science-backed. Some chapters felt repetitive but the core message is gold.",
    createdAt: new Date("2024-04-05T14:20:00Z"),
  },
  {
    id: "rev-003",
    bookId: "deep-work",
    userId: "user-guest-2",
    userName: "Divya R.",
    rating: 5,
    comment:
      "Cal Newport writes like he's speaking directly to you. I've recommended this to my entire team.",
    createdAt: new Date("2024-05-18T09:00:00Z"),
  },
  {
    id: "rev-004",
    bookId: "silent-patient",
    userId: "user-001",
    userName: "Priya Sharma",
    rating: 5,
    comment:
      "The atmosphere in this book is unreal. I read it in one sitting. The twist left me speechless.",
    createdAt: new Date("2024-02-28T22:00:00Z"),
  },
  {
    id: "rev-005",
    bookId: "midnight-library",
    userId: "user-guest-3",
    userName: "Sanjay M.",
    rating: 4,
    comment:
      "Beautiful prose and an unforgettable premise. The ending felt slightly rushed but overall a 4-star read.",
    createdAt: new Date("2024-06-01T11:15:00Z"),
  },
  {
    id: "rev-006",
    bookId: "dune",
    userId: "user-guest-4",
    userName: "Lavanya P.",
    rating: 5,
    comment:
      "A complete universe in a single book. Herbert's world-building is unmatched. A must-read for any sci-fi fan.",
    createdAt: new Date("2024-07-14T19:45:00Z"),
  },
  {
    id: "rev-007",
    bookId: "project-hail-mary",
    userId: "user-guest-5",
    userName: "Rohit S.",
    rating: 5,
    comment:
      "As an aerospace enthusiast, this was a dream come true. Technically accurate and impossibly tense.",
    createdAt: new Date("2024-08-22T07:30:00Z"),
  },
  {
    id: "rev-008",
    bookId: "sapiens",
    userId: "user-guest-6",
    userName: "Tanya L.",
    rating: 5,
    comment:
      "Harari changed the way I see humanity's entire history. Dense but never boring — a genuine masterpiece.",
    createdAt: new Date("2024-09-10T16:00:00Z"),
  },
];

// ── Coupons ────────────────────────────────────────────────────
export const mockCoupons: Coupon[] = [
  {
    code: "BOOKWORM10",
    discountAmount: 50,
    minOrderValue: 299,
    description: "Flat ₹50 off on orders above ₹299",
  },
  {
    code: "NEWUSER100",
    discountAmount: 100,
    minOrderValue: 499,
    description: "₹100 off for new users on orders above ₹499",
  },
  {
    code: "FESTIVE200",
    discountAmount: 200,
    minOrderValue: 999,
    description: "Festival special – ₹200 off on orders above ₹999",
  },
];

// ── Sample Order ───────────────────────────────────────────────
const orderDate = new Date("2024-09-20T10:00:00Z");
export const mockOrders: Order[] = [
  {
    id: "order-001",
    userId: "user-001",
    items: [
      {
        bookId: "atomic-habits",
        quantity: 1,
        selectedFormat: "Paperback",
        priceAtAdd: 499,
        title: "Atomic Habits",
        coverImage: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
      },
      {
        bookId: "deep-work",
        quantity: 1,
        selectedFormat: "Paperback",
        priceAtAdd: 399,
        title: "Deep Work",
        coverImage: "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg",
      },
    ],
    address: sampleAddress,
    subtotal: 898,
    tax: 45,
    discount: 50,
    deliveryCharge: 0,
    totalAmount: 893,
    status: "DELIVERED",
    paymentMethod: "UPI",
    createdAt: orderDate,
    canCancelUntil: addHours(orderDate, 48),
  },
];

// ── Lookup helpers ─────────────────────────────────────────────

/** O(n) book lookup by id */
export const bookById = (id: string): Book | undefined =>
  mockBooks.find((b) => b.id === id);

/** Reviews for a given book */
export const reviewsForBook = (bookId: string): Review[] =>
  mockReviews.filter((r) => r.bookId === bookId);

/** Books filtered by category */
export const booksByCategory = (category: Book["category"]): Book[] =>
  mockBooks.filter((b) => b.category === category);

/** Validate and return a coupon or null */
export const validateCoupon = (
  code: string,
  orderTotal: number
): Coupon | null => {
  const coupon = mockCoupons.find(
    (c) => c.code.toUpperCase() === code.toUpperCase()
  );
  if (!coupon) return null;
  if (orderTotal < coupon.minOrderValue) return null;
  return coupon;
};

/** Find a book by id — named export matching the request's API */
export function getBookById(id: string): Book | undefined {
  return mockBooks.find((b) => b.id === id);
}

/** Get books by category, or all books if category is falsy/"All" */
export function getBooksByCategory(category: string): Book[] {
  if (!category || category === "All") return mockBooks;
  return mockBooks.filter(
    (b) => b.category.toLowerCase() === category.toLowerCase()
  );
}

/** Get related reads: same category or same author, excluding current book */
export function getRelatedReads(currentBookId: string, limit = 4): Book[] {
  const current = getBookById(currentBookId);
  if (!current) return mockBooks.slice(0, limit);
  return mockBooks
    .filter(
      (b) =>
        b.id !== currentBookId &&
        (b.category === current.category || b.author === current.author)
    )
    .slice(0, limit);
}
