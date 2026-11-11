
"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";

interface MeResponse {
  success: boolean;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface AuthGuardProps {
  children: ReactNode;
  mode: "guest" | "protected";
}

export default function AuthGuard({
  children,
  mode,
}: AuthGuardProps) {
  const router = useRouter();

  const [status, setStatus] = useState<
    "checking" | "allowed" | "redirecting" | "error"
  >("checking");

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!active) return;

        if (mode === "protected") {
          setStatus("redirecting");
          router.replace("/login");
        } else {
          setStatus("allowed");
        }

        return;
      }

      try {
        await apiRequest<MeResponse>("/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!active) return;

        if (mode === "guest") {
          setStatus("redirecting");
          router.replace("/dashboard");
        } else {
          setStatus("allowed");
        }
      } catch (error) {
        if (!active) return;

        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          localStorage.removeItem("token");

          if (mode === "protected") {
            setStatus("redirecting");
            router.replace("/login");
          } else {
            setStatus("allowed");
          }

          return;
        }

        setStatus("error");
      }
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, [mode, router]);

  if (
    status === "checking" ||
    status === "redirecting"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-slate-600">
          Unable to verify your account. Check your backend connection.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
