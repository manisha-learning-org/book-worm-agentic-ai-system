"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ShoppingCart,
  Search,
  User,
  ChevronDown,
  Heart,
  Package,
  PenTool,
  LogOut,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useUserStore } from "@/store/user";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("q") ?? ""
  );
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalItemsRaw = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const totalItems = mounted ? totalItemsRaw : 0;
  const { currentUser, isAuthenticated, logout } = useUserStore();

  // ---------- helpers ----------
  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const qs = createQueryString({ q: value || null });
      router.push(`${pathname}?${qs}`);
    }, 350);
  };

  const handleFilterChange = (key: string, value: string) => {
    const qs = createQueryString({ [key]: value || null });
    router.push(`${pathname}?${qs}`);
  };

  const currentLang = searchParams.get("lang") ?? "";
  const currentFormat = searchParams.get("format") ?? "";
  const currentPrice = searchParams.get("price") ?? "";
  const currentSort = searchParams.get("sort") ?? "";
  const currentQ = searchParams.get("q") ?? "";

  const hasActiveFilters =
    !!currentLang || !!currentFormat || !!currentPrice || !!currentSort || !!currentQ;

  const handleClearAll = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchValue("");
    router.push(pathname);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1E1E1E] border-b border-zinc-800 shadow-lg">
      {/* ── Row 1: brand + quick links + search + icons ── */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-3">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-lg font-bold tracking-tight whitespace-nowrap">
            Book Worm
          </span>
        </Link>

        {/* Quick links — hidden on mobile */}
        <nav className="hidden lg:flex items-center gap-1 ml-2 shrink-0">
          {[
            { href: "/orders", label: "My Orders", icon: Package },
            { href: "/wishlist", label: "My Wishlist", icon: Heart },
            { href: "/writers", label: "My Writers", icon: PenTool },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/60 transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="relative flex-1 max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search what you want to read…"
            aria-label="Search books"
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60 transition"
          />
        </div>

        {/* Cart */}
        <Link
          href="/checkout"
          className="relative flex items-center justify-center w-9 h-9 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-700/60 transition-colors"
          aria-label={`Cart – ${totalItems} items`}
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-zinc-900 px-1">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </Link>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-700/60 transition-colors"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <User className="w-5 h-5" />
            {isAuthenticated && currentUser && (
              <span className="hidden sm:inline text-sm truncate max-w-[80px]">
                {currentUser.name.split(" ")[0]}
              </span>
            )}
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 transition-transform",
                userMenuOpen && "rotate-180"
              )}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#1E1E1E] border border-zinc-700 rounded-xl shadow-2xl py-1 z-50">
              {isAuthenticated && currentUser ? (
                <>
                  <div className="px-4 py-2.5 border-b border-zinc-700">
                    <p className="text-sm font-semibold text-zinc-100 truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/60 transition-colors"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/60 transition-colors"
                  >
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      router.push("/logout");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-700/60 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/60 transition-colors"
                >
                  <User className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: filter dropdowns ── */}
      <div className="flex items-center gap-2 overflow-x-auto px-4 md:px-6 pb-3 scrollbar-thin">
        <FilterSelect
          label="Language"
          paramKey="lang"
          value={currentLang}
          options={[
            { value: "", label: "All Languages" },
            { value: "english", label: "English" },
            { value: "hindi", label: "Hindi" },
            { value: "tamil", label: "Tamil" },
            { value: "telugu", label: "Telugu" },
            { value: "kannada", label: "Kannada" },
            { value: "bengali", label: "Bengali" },
            { value: "marathi", label: "Marathi" },
          ]}
          onChange={handleFilterChange}
        />
        <FilterSelect
          label="Format"
          paramKey="format"
          value={currentFormat}
          options={[
            { value: "", label: "All Formats" },
            { value: "Paperback", label: "Paperback" },
            { value: "Hardcover", label: "Hardcover" },
            { value: "eBook", label: "eBook" },
          ]}
          onChange={handleFilterChange}
        />
        <FilterSelect
          label="Price"
          paramKey="price"
          value={currentPrice}
          options={[
            { value: "", label: "Any Price" },
            { value: "0-199", label: "Under ₹200" },
            { value: "200-499", label: "₹200 – ₹499" },
            { value: "500-999", label: "₹500 – ₹999" },
            { value: "1000+", label: "₹1,000+" },
          ]}
          onChange={handleFilterChange}
        />
        <FilterSelect
          label="Sort by"
          paramKey="sort"
          value={currentSort}
          options={[
            { value: "", label: "Relevance" },
            { value: "price_asc", label: "Price: Low to High" },
            { value: "price_desc", label: "Price: High to Low" },
            { value: "rating", label: "Top Rated" },
            { value: "newest", label: "Newest First" },
          ]}
          onChange={handleFilterChange}
        />

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 border border-red-400/30 bg-red-400/10 hover:bg-red-400/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </header>
  );
}

// ── Helper component ──────────────────────────────────────────────────────────

interface FilterSelectProps {
  label: string;
  paramKey: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (key: string, value: string) => void;
}

function FilterSelect({
  label,
  paramKey,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(paramKey, e.target.value)}
        aria-label={label}
        className="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60 cursor-pointer transition hover:border-zinc-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
    </div>
  );
}
