"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import DashboardCards from "@/components/dashboard/DashboardCards";
import type { DashboardResponse } from "@/types/dashboard";

export default function DashboardPage() {
  const router = useRouter();

  const [dashboard, setDashboard] =
    useState<DashboardResponse["dashboard"] | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await apiRequest<DashboardResponse>(
          "/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (active) {
          setDashboard(response.dashboard);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load dashboard"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 sm:p-6">
        {error}
      </div>
    );
  }

  if (!dashboard) {
    return (
      <p className="p-4 text-sm text-slate-500">
        No dashboard data available.
      </p>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">

      {/* Dashboard Heading */}
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Financial Overview
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Your financial activity and performance.
        </p>
      </div>

      {/* Summary Cards */}
      <DashboardCards summary={dashboard.summary} />

      {/* Budget Progress */}
      <section className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-5 text-base font-semibold text-slate-900 sm:text-lg">
          Budget Progress
        </h2>

        {dashboard.budgetProgress.length === 0 ? (
          <p className="text-sm text-slate-500">
            No budgets created yet.
          </p>
        ) : (
          <div className="space-y-6">
            {dashboard.budgetProgress.map((budget) => (
              <div key={budget.id} className="min-w-0">

                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium text-slate-800 sm:text-base">
                      {budget.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      {budget.category.name}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900 sm:text-base">
                      ${budget.spentAmount}
                    </p>

                    <p className="text-xs text-slate-500">
                      of ${budget.budgetAmount}
                    </p>
                  </div>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budget.isExceeded
                        ? "bg-red-500"
                        : "bg-blue-600"
                    }`}
                    style={{
                      width: `${Math.min(
                        Math.max(budget.percentage, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                  {budget.percentage}% used
                  {budget.isExceeded && " — Budget exceeded"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Transactions */}
      <section className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-5 text-base font-semibold text-slate-900 sm:text-lg">
          Recent Transactions
        </h2>

        {dashboard.recentTransactions.length === 0 ? (
          <p className="text-sm text-slate-500">
            No transactions available yet.
          </p>
        ) : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 sm:text-sm">
                  <th className="px-4 pb-3 font-medium sm:px-3">
                    Description
                  </th>

                  <th className="px-4 pb-3 font-medium sm:px-3">
                    Category
                  </th>

                  <th className="px-4 pb-3 font-medium sm:px-3">
                    Date
                  </th>

                  <th className="px-4 pb-3 text-right font-medium sm:px-3">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {dashboard.recentTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="max-w-[180px] truncate px-4 py-4 font-medium text-slate-800 sm:px-3">
                      {transaction.description || "No description"}
                    </td>

                    <td className="px-4 py-4 text-slate-600 sm:px-3">
                      {transaction.category.name}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-slate-500 sm:px-3">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>

                    <td
                      className={`whitespace-nowrap px-4 py-4 text-right font-semibold sm:px-3 ${
                        transaction.type === "INCOME"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}$
                      {transaction.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
