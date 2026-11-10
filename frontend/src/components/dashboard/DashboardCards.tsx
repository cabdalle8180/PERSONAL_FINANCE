import {
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import type { DashboardSummary } from "@/types/dashboard";

interface DashboardCardsProps {
  summary: DashboardSummary;
}

const formatCurrency = (amount: string) => {
  return `$${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function DashboardCards({
  summary,
}: DashboardCardsProps) {
  const cards = [
    {
      title: "Total Balance",
      amount: summary.balance,
      icon: Wallet,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Income",
      amount: summary.totalIncome,
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Expenses",
      amount: summary.totalExpenses,
      icon: TrendingDown,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                {card.title}
              </p>

              <div className={`rounded-xl p-3 ${card.color}`}>
                <Icon size={22} />
              </div>
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              {formatCurrency(card.amount)}
            </h2>
          </div>
        );
      })}
    </div>
  );
}