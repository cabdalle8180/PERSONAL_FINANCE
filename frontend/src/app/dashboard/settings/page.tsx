
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  LogOut,
  Mail,
  CalendarDays,
  Loader2,
  AlertCircle,
  Monitor,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  createdAt?: string;
}

interface ProfileResponse {
  success: boolean;
  user: UserProfile;
  message?: string;
}

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!API_URL) {
          throw new Error("API URL is not configured");
        }

        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = (await response.json()) as ProfileResponse;

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load account");
        }

        setUser(data.user);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [router]);

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmed) return;

    setLoggingOut(true);
    localStorage.removeItem("token");
    router.replace("/login");
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(parsedDate);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account and security settings.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-20">
          <Loader2 size={30} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* PROFILE CARD */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <User size={23} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Account Information
                  </h2>
                  <p className="text-sm text-slate-500">
                    Your registered account details.
                  </p>
                </div>
              </div>
            </div>

            {user && (
              <div className="grid gap-6 p-6 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm text-slate-500">
                    Full Name
                  </p>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <User size={19} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-800">
                      {user.name || "Not available"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-slate-500">
                    Email Address
                  </p>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <Mail size={19} className="text-slate-400" />
                    <span className="break-all text-sm font-medium text-slate-800">
                      {user.email || "Not available"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-slate-500">
                    Account ID
                  </p>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <span className="break-all text-sm font-medium text-slate-800">
                      {user.id}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-slate-500">
                    Member Since
                  </p>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <CalendarDays
                      size={19}
                      className="text-slate-400"
                    />
                    <span className="text-sm font-medium text-slate-800">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* SECURITY */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-50 p-3 text-green-600">
                  <ShieldCheck size={23} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Security
                  </h2>
                  <p className="text-sm text-slate-500">
                    Manage your current login session.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <Monitor
                  size={21}
                  className="mt-1 text-slate-400"
                />
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Current Session
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    You are currently signed in to your account.
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                Active
              </span>
            </div>

            <div className="border-t border-slate-100 p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Log Out
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Sign out and return to the login page.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut size={17} />
                  {loggingOut ? "Logging out..." : "Log Out"}
                </button>
              </div>
            </div>
          </section>

          {/* APPLICATION INFORMATION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">
              Application Information
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Expense Tracker
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Version 1.0.0
            </p>
          </section>
        </>
      )}
    </div>
  );
}
