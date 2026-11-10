
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
    const fetchDashboard = async () => {
      const token = sessionStorage.getItem("token");

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

        setDashboard(response.dashboard);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (!dashboard) {
    return <p>No dashboard data available.</p>;
  }

  return (
    <div className="space-y-8">

      {/* Dashboard Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Financial Overview
        </h1>
        <p className="text-sm text-slate-500">
          Your financial activity and performance.
        </p>
      </div>

      {/* Summary Cards */}
      <DashboardCards summary={dashboard.summary} />

      {/* Budget Progress */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">
          Budget Progress
        </h2>

        {dashboard.budgetProgress.length === 0 ? (
          <p className="text-sm text-slate-500">
            No budgets created yet.
          </p>
        ) : (
          <div className="space-y-6">
            {dashboard.budgetProgress.map((budget) => (
              <div key={budget.id}>
                <div className="mb-2 flex justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-800">
                      {budget.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {budget.category.name}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      ${budget.spentAmount}
                    </p>
                    <p className="text-xs text-slate-500">
                      of ${budget.budgetAmount}
                    </p>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      budget.isExceeded
                        ? "bg-red-500"
                        : "bg-blue-600"
                    }`}
                    style={{
                      width: `${Math.min(budget.percentage, 100)}%`,
                    }}
                  />
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {budget.percentage}% used
                  {budget.isExceeded && " — Budget exceeded"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Transactions */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">
          Recent Transactions
        </h2>

        {dashboard.recentTransactions.length === 0 ? (
          <p className="text-sm text-slate-500">
            No transactions available yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b last:border-0">
                    <td className="py-4 font-medium">
                      {transaction.description || "No description"}
                    </td>

                    <td className="py-4">
                      {transaction.category.name}
                    </td>

                    <td className="py-4 text-slate-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>

                    <td
                      className={`py-4 text-right font-semibold ${
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
