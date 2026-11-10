"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      // Temporary token storage for initial integration.
      sessionStorage.setItem("token", data.token);

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-900">
          Create Account
        </h1>

        <p className="mt-2 text-slate-500">
          Sign up to manage your expenses.
        </p>

        <form onSubmit={handleRegister} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
