
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  ChevronDown,
  UserRound,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UserProfile {
  id: string;
  name?: string | null;
  email?: string;
}

interface ProfileResponse {
  success: boolean;
  user: UserProfile;
  message?: string;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/transactions": "Transactions",
  "/dashboard/categories": "Categories",
  "/dashboard/budgets": "Budgets",
  "/dashboard/settings": "Settings",
};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Dashboard";

  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token || !API_URL) return;

        // Load cached user first
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser) as UserProfile);
        }

        // Get latest profile from backend
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = (await response.json()) as ProfileResponse;

        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    void loadUser();
  }, []);

  return (
    <header className="flex h-16 w-full min-w-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 sm:h-20 sm:gap-4 sm:px-5 lg:px-6">

      {/* Page title */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
          {title}
        </h1>

        <p className="hidden text-sm text-slate-500 sm:block">
          Manage your personal finances
        </p>
      </div>

      {/* Right section */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-3 lg:gap-4">

        {/* Search */}
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 md:flex">
          <Search size={18} className="shrink-0 text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
            className="w-24 bg-transparent text-sm outline-none placeholder:text-slate-400 lg:w-36"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
        >
          <Bell size={21} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Profile */}
        <button
          type="button"
          aria-label="My account"
          className="flex shrink-0 items-center gap-1 rounded-lg p-1.5 transition hover:bg-slate-100 sm:gap-2 sm:p-2"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 sm:h-9 sm:w-9">
            <UserRound size={20} />
          </div>

          <div className="hidden min-w-0 text-left sm:block">
            <p className="max-w-32 truncate text-sm font-semibold text-slate-800">
              {user?.name || "User"}
            </p>

            <p className="max-w-32 truncate text-xs text-slate-500">
              {user?.email || "Account"}
            </p>
          </div>

          <ChevronDown
            size={16}
            className="hidden text-slate-500 sm:block"
          />
        </button>
      </div>
    </header>
  );
}
 