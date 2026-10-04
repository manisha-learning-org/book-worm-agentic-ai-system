"use client";

import { useState } from "react";
import { CreditCard, Wallet, Smartphone, ShieldCheck, Loader2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onPaymentSuccess: (method: string) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  totalAmount,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"credit" | "debit" | "upi" | "wallet">("credit");
  const [isProcessing, setIsProcessing] = useState(false);

  // Card Form State
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Format Card Number (XXXX-XXXX-XXXX-XXXX)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join("-") || raw;
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YYYY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    if (raw.length > 2) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiry(raw);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (activeTab === "credit" || activeTab === "debit") {
      if (cardNumber.replace(/-/g, "").length < 16) {
        setError("Please enter a valid 16-digit card number");
        return;
      }
      if (!cardName.trim()) {
        setError("Please enter the name on your card");
        return;
      }
      if (cvv.length < 3) {
        setError("Please enter a valid CVV");
        return;
      }
      if (expiry.length < 7) {
        setError("Please enter expiration date (MM/YYYY)");
        return;
      }
    } else if (activeTab === "upi") {
      if (!upiId.includes("@")) {
        setError("Please enter a valid UPI ID (e.g. user@okhdfcbank)");
        return;
      }
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const methodLabel =
        activeTab === "credit"
          ? "Credit Card"
          : activeTab === "debit"
          ? "Debit Card"
          : activeTab === "upi"
          ? "UPI"
          : "Wallet";
      onPaymentSuccess(methodLabel);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#1e1e22] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#26262b] border-b border-zinc-800">
          <h2 className="text-base font-semibold tracking-wide text-zinc-100">
            Complete Payment
          </h2>
          <div className="text-sm font-bold text-zinc-200">
            Payable Amount: <span className="text-emerald-400">₹{totalAmount}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex flex-col md:flex-row min-h-[320px]">
          {/* Left Tabs */}
          <div className="w-full md:w-48 bg-[#18181b] border-r border-zinc-800/80 flex flex-row md:flex-col">
            <button
              type="button"
              onClick={() => { setActiveTab("credit"); setError(""); }}
              className={`flex-1 md:flex-none text-left px-5 py-3.5 text-xs font-medium border-b md:border-b-0 md:border-l-2 transition-colors ${
                activeTab === "credit"
                  ? "bg-[#242429] text-white border-amber-500"
                  : "text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              Credit Card
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("debit"); setError(""); }}
              className={`flex-1 md:flex-none text-left px-5 py-3.5 text-xs font-medium border-b md:border-b-0 md:border-l-2 transition-colors ${
                activeTab === "debit"
                  ? "bg-[#242429] text-white border-amber-500"
                  : "text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              Debit card
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("upi"); setError(""); }}
              className={`flex-1 md:flex-none text-left px-5 py-3.5 text-xs font-medium border-b md:border-b-0 md:border-l-2 transition-colors ${
                activeTab === "upi"
                  ? "bg-[#242429] text-white border-amber-500"
                  : "text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              UPI
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("wallet"); setError(""); }}
              className={`flex-1 md:flex-none text-left px-5 py-3.5 text-xs font-medium border-b md:border-b-0 md:border-l-2 transition-colors ${
                activeTab === "wallet"
                  ? "bg-[#242429] text-white border-amber-500"
                  : "text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              Wallet
            </button>
          </div>

          {/* Right Form */}
          <div className="flex-1 p-6 bg-[#1e1e22]">
            {error && (
              <div className="mb-4 p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handlePay} className="space-y-4">
              {(activeTab === "credit" || activeTab === "debit") && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full bg-[#2a2a30] border border-zinc-700 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        placeholder="Name"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-[#2a2a30] border border-zinc-700 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        placeholder="XXX"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-[#2a2a30] border border-zinc-700 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Date of Expiry
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YYYY"
                        value={expiry}
                        onChange={handleExpiryChange}
                        className="w-full bg-[#2a2a30] border border-zinc-700 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "upi" && (
                <div className="space-y-3 py-2">
                  <label className="block text-[11px] font-medium text-zinc-400">
                    Enter Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <input
                    type="text"
                    placeholder="mobileNumber@upi / username@bank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-[#2a2a30] border border-zinc-700 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <p className="text-[11px] text-zinc-400 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    A payment request will be sent to your UPI app.
                  </p>
                </div>
              )}

              {activeTab === "wallet" && (
                <div className="p-4 bg-[#28282e] rounded border border-zinc-700/60 space-y-2">
                  <p className="text-xs text-zinc-300">
                    Available Gift Points: <span className="font-bold text-amber-400">500 pts (₹500)</span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Points will be debited towards the total payable amount of ₹{totalAmount}.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded text-xs font-medium text-zinc-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs px-5 py-2.5 rounded transition shadow-md"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay Now</span>
                      <CreditCard className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PaymentModal;
