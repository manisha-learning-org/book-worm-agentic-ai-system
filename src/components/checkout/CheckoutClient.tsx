"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  MapPin,
  Tag,
  Gift,
  Truck,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useUserStore } from "@/store/user";
import { useOrdersStore } from "@/store/orders";
import { bookById, validateCoupon } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { BookFormat, PaymentMethod, Order, Address } from "@/lib/types";
import PaymentModal from "./PaymentModal";

// ── Constants ────────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman & Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

// ── Address form state ───────────────────────────────────────────────────────
interface AddressForm {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  email: string;
  city: string;
  pincode: string;
  phone: string;
  state: string;
  country: string;
}

const EMPTY_FORM: AddressForm = {
  firstName: "",
  lastName: "",
  addressLine1: "",
  addressLine2: "",
  email: "",
  city: "",
  pincode: "",
  phone: "",
  state: "",
  country: "India",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function deliveryDate(tentativeDays: string): string {
  const match = tentativeDays.match(/\d+/g);
  const maxDays = match ? parseInt(match[match.length - 1], 10) + 1 : 5;
  const d = new Date();
  d.setDate(d.getDate() + maxDays);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// ── Remove-item confirmation modal ──────────────────────────────────────────
interface RemoveModalProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}
function RemoveModal({ title, onConfirm, onCancel }: RemoveModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#1E1E1E] border border-zinc-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-zinc-100 mb-1">Remove item?</h3>
            <p className="text-sm text-zinc-400">
              Remove <span className="text-zinc-200 font-medium">&ldquo;{title}&rdquo;</span> from your cart?
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CheckoutClient() {
  const { items, updateQuantity, removeItem, coupon, applyCoupon, removeCoupon, clearCart } = useCartStore();
  const { currentUser, updateGiftPoints } = useUserStore();
  const { addOrder } = useOrdersStore();
  const router = useRouter();

  // ── Address form & selection ──────────────────────────────────
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});
  const [formTouched, setFormTouched] = useState(false);

  // ── Coupon / gift points ──────────────────────────────────────
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [giftPointsInput, setGiftPointsInput] = useState("");
  const [giftPointsApplied, setGiftPointsApplied] = useState(0);
  const [giftPointsError, setGiftPointsError] = useState("");
  const [activeTab, setActiveTab] = useState<"coupon" | "gift">("coupon");

  // ── Remove confirmation ───────────────────────────────────────
  const [removeTarget, setRemoveTarget] = useState<{
    bookId: string;
    format: BookFormat;
    title: string;
  } | null>(null);

  // ── Payment modal ─────────────────────────────────────────────
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ── Order summary calculations ───────────────────────────────
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.priceAtAdd * i.quantity, 0),
    [items]
  );

  // GST: 12% for books above ₹200 avg, 5% otherwise
  const taxRate = subtotal / Math.max(items.length, 1) > 200 ? 0.12 : 0.05;
  const tax = Math.round(subtotal * taxRate);
  const delivery = subtotal > 500 ? 0 : 40;
  const couponDiscount = coupon ? coupon.discountAmount : 0;
  const giftDiscount = giftPointsApplied;
  const total = Math.max(0, subtotal + tax + delivery - couponDiscount - giftDiscount);

  // ── Saved addresses handling ──────────────────────────────────
  const savedAddresses = currentUser?.savedAddresses ?? [];

  const fillFormFromAddress = useCallback((addr: Address) => {
    const nameParts = addr.fullName.trim().split(" ");
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") ?? "";
    setForm({
      firstName,
      lastName,
      addressLine1: addr.line1,
      addressLine2: addr.line2 ?? "",
      email: currentUser?.email ?? "",
      city: addr.city,
      pincode: addr.pincode,
      phone: addr.phone,
      state: addr.state,
      country: addr.country,
    });
    setFormErrors({});
  }, [currentUser?.email]);

  // Pre-fill with the first saved address by default if available
  useEffect(() => {
    if (savedAddresses.length > 0 && selectedAddressId === "new" && !useSavedAddress) {
      const firstAddr = savedAddresses[0];
      setSelectedAddressId(firstAddr.id);
      setUseSavedAddress(true);
      fillFormFromAddress(firstAddr);
    }
  }, [savedAddresses, selectedAddressId, useSavedAddress, fillFormFromAddress]);

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === "new") {
      setUseSavedAddress(false);
      setForm({
        ...EMPTY_FORM,
        email: currentUser?.email ?? "",
      });
      setFormErrors({});
    } else {
      setUseSavedAddress(true);
      const chosen = savedAddresses.find((a) => a.id === addressId);
      if (chosen) {
        fillFormFromAddress(chosen);
      }
    }
  };

  // ── Field change ──────────────────────────────────────────────
  const handleField = (
    key: keyof AddressForm,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formTouched) validateField(key, value);
  };

  // ── Single field validation ───────────────────────────────────
  const validateField = (key: keyof AddressForm, value: string) => {
    let error = "";
    if (key !== "addressLine2") {
      if (!value.trim()) error = "This field is required";
    }
    if (key === "pincode" && value && !/^\d{6}$/.test(value)) {
      error = "PIN code must be exactly 6 digits";
    }
    if (key === "phone" && value && !/^\d{10}$/.test(value)) {
      error = "Enter a valid 10-digit number";
    }
    if (key === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = "Enter a valid email address";
    }
    setFormErrors((prev) => ({ ...prev, [key]: error }));
    return error;
  };

  // ── Full form validation ──────────────────────────────────────
  const validateAll = (): boolean => {
    setFormTouched(true);
    const required: (keyof AddressForm)[] = [
      "firstName", "lastName", "addressLine1", "email",
      "city", "pincode", "phone", "state", "country",
    ];
    const errors: Partial<Record<keyof AddressForm, string>> = {};
    let valid = true;
    for (const key of required) {
      const err = validateField(key, form[key]);
      if (err) {
        errors[key] = err;
        valid = false;
      }
    }
    setFormErrors(errors);
    return valid;
  };

  // ── Coupon apply ──────────────────────────────────────────────
  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    const result = validateCoupon(couponInput.trim(), subtotal);
    if (!result) {
      setCouponError(
        subtotal < 1
          ? "Add items to cart first"
          : "Invalid coupon or order total too low"
      );
      removeCoupon();
    } else {
      applyCoupon(result);
      setCouponSuccess(result.description ?? `₹${result.discountAmount} discount applied!`);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput("");
    setCouponError("");
    setCouponSuccess("");
  };

  // ── Gift points apply ──────────────────────────────────────────
  const handleApplyGiftPoints = () => {
    setGiftPointsError("");
    const pts = parseInt(giftPointsInput, 10);
    if (isNaN(pts) || pts <= 0) {
      setGiftPointsError("Enter a valid number of points");
      return;
    }
    const available = currentUser?.giftPointsBalance ?? 0;
    if (pts > available) {
      setGiftPointsError(`You only have ${available} gift points`);
      return;
    }
    const maxUsable = Math.min(pts, subtotal);
    setGiftPointsApplied(maxUsable);
  };

  const handleRemoveGiftPoints = () => {
    setGiftPointsApplied(0);
    setGiftPointsInput("");
    setGiftPointsError("");
  };

  // ── Pay now – opens payment modal after address validation ────
  const handlePayNow = () => {
    if (items.length === 0) return;
    const valid = validateAll();
    if (!valid) {
      document
        .getElementById("address-section")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setShowPaymentModal(true);
  };

  // ── Called by PaymentModal on success ─────────────────────────
  const handlePaymentSuccess = (method: PaymentMethod) => {
    const now = new Date();
    const cancelUntil = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const deliveryAddress: Address = {
      id: crypto.randomUUID(),
      label: "Delivery",
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      phone: form.phone,
      line1: form.addressLine1,
      line2: form.addressLine2 || undefined,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      country: form.country,
    };

    const orderId = `order-${now.getTime()}`;

    const newOrder: Order = {
      id: orderId,
      userId: currentUser?.id ?? "guest",
      items: items.map((item) => {
        const book = bookById(item.bookId);
        return {
          ...item,
          title: book?.title ?? "Unknown Book",
          coverImage: book?.coverImage ?? "",
        };
      }),
      address: deliveryAddress,
      subtotal,
      tax,
      discount: couponDiscount + giftDiscount,
      deliveryCharge: delivery,
      totalAmount: total,
      status: "CONFIRMED",
      paymentMethod: method,
      createdAt: now,
      canCancelUntil: cancelUntil,
    };

    addOrder(newOrder);

    // Deduct gift points if applied
    if (giftDiscount > 0) {
      updateGiftPoints(-giftDiscount);
    }

    clearCart();
    setShowPaymentModal(false);
    router.push(`/order-confirmation/${orderId}`);
  };

  // ── Quantity controls ─────────────────────────────────────────
  const handleDecrement = (bookId: string, format: BookFormat, qty: number, title: string) => {
    if (qty === 1) {
      setRemoveTarget({ bookId, format, title });
    } else {
      updateQuantity(bookId, format, qty - 1);
    }
  };

  const handleIncrement = (bookId: string, format: BookFormat, qty: number) => {
    updateQuantity(bookId, format, qty + 1);
  };

  // ── Empty cart ─────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Your cart is empty</h2>
          <p className="text-zinc-400 mb-6">Add some books to get started!</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-400 text-zinc-900 font-semibold hover:bg-yellow-300 transition-colors"
          >
            Browse Books
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
      {/* ── Page title ── */}
      <div className="flex items-center gap-2 mb-6">
        <ShoppingCart className="w-5 h-5 text-yellow-400" />
        <h1 className="text-xl font-bold text-zinc-100">Shopping Cart & Checkout</h1>
        <span className="ml-auto text-sm text-zinc-400">
          {items.reduce((s, i) => s + i.quantity, 0)} item
          {items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* ══════════════════════════════════════════════════════
            LEFT COLUMN — Cart + Address
        ══════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          {/* ── Cart Items ───────────────────────────────────── */}
          <section className="bg-[#1E1E1E] border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h2 className="font-semibold text-zinc-100">Cart Items</h2>
            </div>

            <ul className="divide-y divide-zinc-800">
              {items.map((item) => {
                const book = bookById(item.bookId);
                if (!book) return null;
                return (
                  <CartRow
                    key={`${item.bookId}-${item.selectedFormat}`}
                    book={book}
                    item={item}
                    onDecrement={() =>
                      handleDecrement(
                        item.bookId,
                        item.selectedFormat,
                        item.quantity,
                        book.title
                      )
                    }
                    onIncrement={() =>
                      handleIncrement(item.bookId, item.selectedFormat, item.quantity)
                    }
                    onRemove={() =>
                      setRemoveTarget({
                        bookId: item.bookId,
                        format: item.selectedFormat,
                        title: book.title,
                      })
                    }
                  />
                );
              })}
            </ul>
          </section>

          {/* ── Address Section ───────────────────────────────── */}
          <section
            id="address-section"
            className="bg-[#1E1E1E] border border-zinc-800 rounded-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <h2 className="font-semibold text-zinc-100">Delivery Address</h2>
              </div>
              {savedAddresses.length > 0 && (
                <span className="text-xs text-zinc-400">
                  {savedAddresses.length} saved {savedAddresses.length === 1 ? "address" : "addresses"}
                </span>
              )}
            </div>

            {/* Address Selection Option Cards */}
            {savedAddresses.length > 0 && (
              <div className="p-5 pb-0">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
                  Select Delivery Address
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr.id)}
                        className={cn(
                          "cursor-pointer p-4 rounded-xl border transition-all text-left relative",
                          isSelected
                            ? "bg-yellow-400/10 border-yellow-400/80 ring-1 ring-yellow-400/50"
                            : "bg-zinc-800/40 border-zinc-700/60 hover:border-zinc-600 hover:bg-zinc-800/70"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-800 text-yellow-400 border border-yellow-400/20">
                            {addr.label || "Home"}
                          </span>
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                              isSelected
                                ? "border-yellow-400 bg-yellow-400"
                                : "border-zinc-500"
                            )}
                          >
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-zinc-200">{addr.fullName}</p>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">Phone: {addr.phone}</p>
                      </div>
                    );
                  })}

                  {/* Option to enter a different/new address */}
                  <div
                    onClick={() => handleSelectAddress("new")}
                    className={cn(
                      "cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-center items-center text-center min-h-[120px]",
                      selectedAddressId === "new"
                        ? "bg-yellow-400/10 border-yellow-400/80 ring-1 ring-yellow-400/50"
                        : "bg-zinc-800/40 border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/70"
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-medium text-sm text-zinc-200">
                      <span>+ Deliver to a different address</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Enter a new recipient name or delivery location
                    </p>
                  </div>
                </div>

                {useSavedAddress && (
                  <div className="px-4 py-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-xs text-zinc-300 flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>
                      Delivery details pre-filled. You can also edit the form fields below if needed.
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="p-5">
              <AddressForm
                form={form}
                errors={formErrors}
                onChange={handleField}
                onBlur={(key) => {
                  setFormTouched(true);
                  validateField(key, form[key]);
                }}
              />
            </div>
          </section>
        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT COLUMN — Order Summary
        ══════════════════════════════════════════════════════ */}
        <aside className="bg-[#1E1E1E] border border-zinc-800 rounded-2xl overflow-hidden sticky top-24">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h2 className="font-semibold text-zinc-100">Order Summary</h2>
          </div>

          <div className="p-5 space-y-4">
            {/* Line items */}
            <div className="space-y-2.5 text-sm">
              <SummaryRow label="Base Price" value={formatPrice(subtotal)} />
              <SummaryRow
                label={`GST (${(taxRate * 100).toFixed(0)}%)`}
                value={formatPrice(tax)}
              />
              <SummaryRow
                label="Delivery"
                value={delivery === 0 ? "Free" : formatPrice(delivery)}
                valueClass={delivery === 0 ? "text-green-400 font-medium" : undefined}
              />
              {couponDiscount > 0 && (
                <SummaryRow
                  label={`Coupon (${coupon?.code})`}
                  value={`-${formatPrice(couponDiscount)}`}
                  valueClass="text-green-400"
                />
              )}
              {giftDiscount > 0 && (
                <SummaryRow
                  label="Gift Points"
                  value={`-${formatPrice(giftDiscount)}`}
                  valueClass="text-green-400"
                />
              )}
            </div>

            <div className="border-t border-zinc-700 pt-3 flex items-baseline justify-between">
              <span className="text-zinc-300 font-semibold">Total</span>
              <span className="text-2xl font-bold text-yellow-400">
                {formatPrice(total)}
              </span>
            </div>

            {/* Delivery badge */}
            {delivery === 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400">
                <Truck className="w-3.5 h-3.5" />
                Free delivery on this order!
              </div>
            )}

            {/* ── Coupon / Gift Points tabs ── */}
            <div className="border border-zinc-700 rounded-xl overflow-hidden">
              {/* Tab switcher */}
              <div className="flex border-b border-zinc-700">
                <TabButton
                  active={activeTab === "coupon"}
                  onClick={() => setActiveTab("coupon")}
                  icon={<Tag className="w-3.5 h-3.5" />}
                  label="Coupon"
                />
                <TabButton
                  active={activeTab === "gift"}
                  onClick={() => setActiveTab("gift")}
                  icon={<Gift className="w-3.5 h-3.5" />}
                  label={`Gift Points${currentUser ? ` (${currentUser.giftPointsBalance})` : ""}`}
                />
              </div>

              <div className="p-3">
                {activeTab === "coupon" ? (
                  coupon ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-mono font-bold">{coupon.code}</span>
                        <span className="text-xs text-zinc-400">applied</span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                          placeholder="Enter coupon code"
                          className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60 transition font-mono"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="px-4 py-2 rounded-lg text-sm font-semibold bg-yellow-400 text-zinc-900 hover:bg-yellow-300 transition-colors whitespace-nowrap"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {couponError}
                        </p>
                      )}
                      {couponSuccess && (
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {couponSuccess}
                        </p>
                      )}
                      <p className="text-[11px] text-zinc-500">
                        Try: BOOKWORM10 · NEWUSER100 · FESTIVE200
                      </p>
                    </div>
                  )
                ) : giftPointsApplied > 0 ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{giftPointsApplied} pts → {formatPrice(giftPointsApplied)}</span>
                    </div>
                    <button
                      onClick={handleRemoveGiftPoints}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max={currentUser?.giftPointsBalance ?? 0}
                        value={giftPointsInput}
                        onChange={(e) => setGiftPointsInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyGiftPoints()}
                        placeholder={`Max ${currentUser?.giftPointsBalance ?? 0} pts`}
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60 transition"
                      />
                      <button
                        onClick={handleApplyGiftPoints}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-yellow-400 text-zinc-900 hover:bg-yellow-300 transition-colors whitespace-nowrap"
                      >
                        Apply
                      </button>
                    </div>
                    {giftPointsError && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {giftPointsError}
                      </p>
                    )}
                    <p className="text-[11px] text-zinc-500">
                      1 gift point = ₹1 discount
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pay Now */}
            <button
              onClick={handlePayNow}
              className="w-full py-3.5 rounded-xl font-bold text-base bg-yellow-400 text-zinc-900 hover:bg-yellow-300 active:scale-[0.98] transition-all shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2"
            >
              Pay {formatPrice(total)}
              <ChevronRight className="w-5 h-5" />
            </button>

            <p className="text-center text-[11px] text-zinc-500">
              By placing this order you agree to our{" "}
              <span className="text-zinc-400 underline cursor-pointer">Terms &amp; Conditions</span>
            </p>
          </div>
        </aside>
      </div>

      {/* ── Remove confirmation modal ── */}
      {removeTarget && (
        <RemoveModal
          title={removeTarget.title}
          onConfirm={() => {
            removeItem(removeTarget.bookId, removeTarget.format);
            setRemoveTarget(null);
          }}
          onCancel={() => setRemoveTarget(null)}
        />
      )}

      {/* ── Payment modal ── */}
      {showPaymentModal && (
        <PaymentModal
          total={total}
          giftPointsApplied={giftDiscount}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </main>
  );
}

// ── CartRow ───────────────────────────────────────────────────────────────────
interface CartRowProps {
  book: NonNullable<ReturnType<typeof bookById>>;
  item: { bookId: string; quantity: number; selectedFormat: BookFormat; priceAtAdd: number };
  onDecrement: () => void;
  onIncrement: () => void;
  onRemove: () => void;
}

function CartRow({ book, item, onDecrement, onIncrement, onRemove }: CartRowProps) {
  if (!book) return null;
  const lineTotal = item.priceAtAdd * item.quantity;

  return (
    <li className="flex gap-3 px-5 py-4">
      {/* Cover */}
      <div className="w-16 shrink-0">
        <BookCover
          src={book.coverImage}
          title={book.title}
          author={book.author}
          className="w-full h-full object-cover"
          aspectRatio="aspect-[2/3]"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-zinc-100 leading-snug line-clamp-2">
              {book.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">by {book.author}</p>
          </div>
          <button
            onClick={onRemove}
            aria-label={`Remove ${book.title} from cart`}
            className="shrink-0 p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1">
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-700 text-zinc-300">
            {book.category}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-700 text-zinc-300">
            {item.selectedFormat}
          </span>
          {book.isBestseller && (
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-yellow-400/20 text-yellow-400">
              Bestseller
            </span>
          )}
        </div>

        {/* Delivery */}
        <p className="text-[11px] text-zinc-400 flex items-center gap-1">
          <Truck className="w-3 h-3" />
          Delivery by {deliveryDate(book.tentativeDeliveryDays)}
        </p>

        {/* Bottom row: price + qty */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-100">
              {formatPrice(lineTotal)}
            </span>
            {item.quantity > 1 && (
              <span className="text-[11px] text-zinc-500">
                {formatPrice(item.priceAtAdd)} × {item.quantity}
              </span>
            )}
          </div>

          {/* Quantity stepper */}
          <div className="flex items-center gap-1 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
            <button
              onClick={onDecrement}
              aria-label="Decrease quantity"
              className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-zinc-100 tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={onIncrement}
              aria-label="Increase quantity"
              className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

// ── AddressForm ───────────────────────────────────────────────────────────────
interface AddressFormProps {
  form: AddressForm;
  errors: Partial<Record<keyof AddressForm, string>>;
  onChange: (key: keyof AddressForm, value: string) => void;
  onBlur: (key: keyof AddressForm) => void;
}

function AddressForm({ form, errors, onChange, onBlur }: AddressFormProps) {
  const field = (
    key: keyof AddressForm,
    label: string,
    placeholder: string,
    opts?: {
      type?: string;
      required?: boolean;
      prefix?: string;
      maxLength?: number;
    }
  ) => {
    const required = opts?.required !== false;
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-400">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <div className="relative flex">
          {opts?.prefix && (
            <span className="flex items-center px-3 bg-zinc-700 border border-r-0 border-zinc-600 rounded-l-lg text-sm text-zinc-300 shrink-0">
              {opts.prefix}
            </span>
          )}
          <input
            type={opts?.type ?? "text"}
            value={form[key]}
            placeholder={placeholder}
            maxLength={opts?.maxLength}
            onChange={(e) => onChange(key, e.target.value)}
            onBlur={() => onBlur(key)}
            aria-label={label}
            aria-required={required}
            aria-invalid={!!errors[key]}
            className={cn(
              "flex-1 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60 transition",
              opts?.prefix ? "rounded-r-lg" : "rounded-lg",
              errors[key] && "border-red-500/60 focus:ring-red-500/30"
            )}
          />
        </div>
        {errors[key] && (
          <p className="text-[11px] text-red-400 flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {errors[key]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {field("firstName", "First Name", "Priya")}
      {field("lastName", "Last Name", "Sharma")}
      {field("addressLine1", "Address Line 1", "42, Elm Street, Koramangala")}
      {field("addressLine2", "Address Line 2 (optional)", "Apt / Suite / Block", {
        required: false,
      })}
      {field("email", "Email Address", "priya@example.com", { type: "email" })}
      {field("city", "City", "Bengaluru")}
      {field("pincode", "PIN Code", "560095", { maxLength: 6 })}
      {field("phone", "Phone Number", "9876543210", {
        type: "tel",
        prefix: "+91",
        maxLength: 10,
      })}

      {/* State dropdown */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-400">
          State <span className="text-red-400">*</span>
        </label>
        <select
          value={form.state}
          onChange={(e) => onChange("state", e.target.value)}
          onBlur={() => onBlur("state")}
          aria-label="State"
          aria-required
          aria-invalid={!!errors.state}
          className={cn(
            "px-3 py-2.5 text-sm text-zinc-100 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60 transition appearance-none",
            !form.state && "text-zinc-600",
            errors.state && "border-red-500/60 focus:ring-red-500/30"
          )}
        >
          <option value="" disabled className="text-zinc-600">Select state…</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s} className="text-zinc-100 bg-zinc-900">
              {s}
            </option>
          ))}
        </select>
        {errors.state && (
          <p className="text-[11px] text-red-400 flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {errors.state}
          </p>
        )}
      </div>

      {/* Country (locked to India) */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-400">
          Country <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.country}
          readOnly
          className="px-3 py-2.5 text-sm text-zinc-400 bg-zinc-900 border border-zinc-700 rounded-lg cursor-not-allowed"
          aria-label="Country"
        />
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400">{label}</span>
      <span className={cn("text-zinc-200", valueClass)}>{value}</span>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors",
        active
          ? "bg-zinc-700 text-zinc-100"
          : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
