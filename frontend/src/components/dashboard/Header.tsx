"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  ChevronDown,
  UserRound,
} from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/transactions": "Transactions",
  "/dashboard/categories": "Categories",
  "/dashboard/budgets": "Budgets",
  "/dashboard/settings": "Settings",
};

export default function Header() {
  const pathname = usePathname();

  const title =
    pageTitles[pathname] ?? "Dashboard";

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="text-sm text-slate-500">
          Manage your personal finances
        </p>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 md:flex">
          <Search size={18} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="w-36 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
        >
          <Bell size={21} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Profile */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-slate-100"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <UserRound size={20} />
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-800">
              My Account
            </p>
            <p className="text-xs text-slate-500">
              Personal
            </p>
          </div>

          <ChevronDown size={16} className="text-slate-500" />
        </button>

      </div>
    </header>
  );
}