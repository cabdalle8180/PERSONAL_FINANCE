"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Wallet,
  Settings,
  LogOut,
  WalletCards,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transactions",
    href: "/dashboard/transactions",
    icon: ArrowLeftRight,
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: Tags,
  },
  {
    name: "Budgets",
    href: "/dashboard/budgets",
    icon: Wallet,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <aside className="flex min-h-screen w-16 shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 sm:w-20 lg:w-64">

      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-slate-100 px-2 sm:h-20 lg:justify-start lg:gap-3 lg:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <WalletCards size={23} />
        </div>

        <div className="hidden min-w-0 lg:block">
          <h1 className="truncate text-lg font-bold text-slate-900">
            ExpenseTrack
          </h1>
          <p className="text-xs text-slate-500">
            Personal Finance
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-2 py-6 lg:px-4">
        <p className="mb-4 hidden px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 lg:block">
          Menu
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              aria-label={item.name}
              className={`flex items-center justify-center gap-3 rounded-xl px-2 py-3 text-sm font-medium transition lg:justify-start lg:px-4 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={20} className="shrink-0" />

              <span className="hidden lg:block">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-100 p-2 lg:p-4">
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          className="flex w-full items-center justify-center gap-3 rounded-xl px-2 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 lg:justify-start lg:px-4"
        >
          <LogOut size={20} className="shrink-0" />

          <span className="hidden lg:block">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
