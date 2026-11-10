"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

import DashboardCards from "@/components/dashboard/DashboardCards";

import type { DashboardResponse } from "@/types/dashboard";

export default function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardResponse["dashboard"] | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const data = await apiRequest<DashboardResponse>(
          "/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDashboard(data.dashboard);
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
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-5 text-red-600">
        {error}
      </div>
    );
  }

  if (!dashboard) {
    return <p>No dashboard data available.</p>;
  }

  return (
    <div className="space-y-8">

      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Financial Overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Here is your financial summary.
        </p>
      </div>

      {/* Summary cards */}
      <DashboardCards summary={dashboard.summary} />

      {/* Budget progress and recent transactions
          will be added in the next step */}

    </div>
  );
}