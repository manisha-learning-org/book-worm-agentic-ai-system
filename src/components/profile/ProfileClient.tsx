"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Shield,
  Gift,
  MapPin,
  Plus,
  Trash2,
  Calendar,
  LogOut,
  Package,
  CheckCircle,
} from "lucide-react";
import { useUserStore } from "@/store/user";
import type { Address } from "@/lib/types";

export default function ProfileClient() {
  const router = useRouter();
  const { currentUser, isAuthenticated, addAddress, removeAddress } = useUserStore();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    fullName: currentUser?.name || "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [formError, setFormError] = useState<string | null>(null);

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center shadow-xl">
        <UserIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-zinc-100">Sign in to view your profile</h2>
        <p className="text-sm text-zinc-400 mt-2 mb-6">
          You need to be logged in to view your account details, addresses, and gift points.
        </p>
        <Link
          href="/login?redirect=/profile"
          className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold text-sm transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      setFormError("Please fill in all required fields.");
      return;
    }

    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      label: addressForm.label,
      fullName: addressForm.fullName,
      phone: addressForm.phone,
      line1: addressForm.line1,
      line2: addressForm.line2,
      city: addressForm.city,
      state: addressForm.state,
      pincode: addressForm.pincode,
      country: addressForm.country,
    };

    addAddress(newAddress);
    setShowAddressModal(false);
    setAddressForm({
      label: "Home",
      fullName: currentUser.name || "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    });
    setFormError(null);
  };

  const formattedJoinDate = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Member";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">My Profile</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your personal info, saved addresses, and rewards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors"
          >
            <Package className="w-4 h-4" /> My Orders
          </Link>
          <button
            onClick={() => router.push("/logout")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* User Info Card */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-lg shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-zinc-100 truncate">{currentUser.name}</h2>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" /> {currentUser.email}
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-yellow-400" />
              Role: <strong className="text-zinc-200">{currentUser.role}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedJoinDate}
            </span>
          </div>
        </div>

        {/* Gift Points Card */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Gift Points Balance
              </span>
              <Gift className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-extrabold text-yellow-400">
              {currentUser.giftPointsBalance}{" "}
              <span className="text-sm font-normal text-zinc-400">pts</span>
            </p>
          </div>
          <p className="text-xs text-zinc-400 mt-4 pt-4 border-t border-zinc-800/80">
            Earn 1 point for every ₹100 spent. Redeem points at checkout for instant discounts!
          </p>
        </div>

        {/* Saved Addresses Summary */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Saved Addresses
              </span>
              <MapPin className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-extrabold text-zinc-100">
              {currentUser.savedAddresses?.length || 0}
            </p>
          </div>
          <p className="text-xs text-zinc-400 mt-4 pt-4 border-t border-zinc-800/80">
            Saved addresses are automatically available during fast checkout.
          </p>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Delivery Addresses</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Add and manage your delivery addresses
            </p>
          </div>
          <button
            onClick={() => setShowAddressModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>

        {currentUser.savedAddresses && currentUser.savedAddresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentUser.savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className="relative p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                      {addr.label || "Home"}
                    </span>
                    <button
                      onClick={() => removeAddress(addr.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-zinc-200">{addr.fullName}</p>
                  <p className="text-xs text-zinc-400 mt-1">{addr.line1}</p>
                  {addr.line2 && <p className="text-xs text-zinc-400">{addr.line2}</p>}
                  <p className="text-xs text-zinc-400">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-xs text-zinc-400">{addr.country}</p>
                  <p className="text-xs text-zinc-400 mt-2">
                    <span className="text-zinc-500">Phone:</span> {addr.phone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-400 text-sm">
            <MapPin className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
            No addresses saved yet. Click &quot;Add Address&quot; to add one.
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-zinc-100 mb-4">Add New Address</h3>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAddress} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Label (e.g. Home, Office)
                  </label>
                  <input
                    type="text"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                  placeholder="House / Flat / Block No., Street"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={addressForm.line2}
                  onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                  placeholder="Apartment, suite, landmark"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={addressForm.country}
                    disabled
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700 text-zinc-400 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold text-sm transition-colors"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
