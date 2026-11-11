
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Wallet,
  TrendingUp,
  TrendingDown,
  Loader2,
  CalendarDays,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type CategoryType = "INCOME" | "EXPENSE";

interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
}

interface Budget {
  id: string;
  name: string;
  amount: string;
  month: number;
  year: number;
  categoryId: string;
  category: Category;
}

interface Transaction {
  id: string;
  amount: string;
  type: CategoryType;
  date: string;
  categoryId: string;
}

interface BudgetForm {
  name: string;
  amount: string;
  month: number;
  year: number;
  categoryId: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  budgets?: T[];
  categories?: T[];
  transactions?: T[];
  budget?: T;
}

interface BudgetWithProgress extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
}

const currentDate = new Date();

const initialForm: BudgetForm = {
  name: "",
  amount: "",
  month: currentDate.getMonth() + 1,
  year: currentDate.getFullYear(),
  categoryId: "",
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [form, setForm] = useState<BudgetForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear()
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const apiRequest = async <T,>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    if (!API_URL) {
      throw new Error("API URL is not configured");
    }

    const token = getToken();

    if (!token) {
      throw new Error("Session expired. Please login again.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = (await response.json()) as T | {
      success: false;
      message: string;
    };

    if (!response.ok) {
      throw new Error(
        "message" in data ? data.message : "Something went wrong"
      );
    }

    return data as T;
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [budgetResponse, categoryResponse, transactionResponse] =
        await Promise.all([
          apiRequest<ApiResponse<Budget>>(
            `/budgets?month=${selectedMonth}&year=${selectedYear}`
          ),
          apiRequest<ApiResponse<Category>>("/categories"),
          apiRequest<ApiResponse<Transaction>>("/transactions"),
        ]);

      setBudgets(budgetResponse.budgets ?? []);
      setCategories(categoryResponse.categories ?? []);
      setTransactions(transactionResponse.transactions ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load budgets"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetForm = () => {
    setForm({
      ...initialForm,
      month: selectedMonth,
      year: selectedYear,
    });
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Budget name is required");
      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0 || !/^\d{1,10}(\.\d{1,2})?$/.test(form.amount)) {
      setError("Enter a valid amount with up to 2 decimal places");
      return;
    }

    if (!form.categoryId) {
      setError("Please select an expense category");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        amount: form.amount,
        month: Number(form.month),
        year: Number(form.year),
        categoryId: form.categoryId,
      };

      if (editingId) {
        await apiRequest<ApiResponse<Budget>>(
          `/budgets/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        setSuccess("Budget updated successfully");
      } else {
        await apiRequest<ApiResponse<Budget>>("/budgets", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccess("Budget created successfully");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save budget"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingId(budget.id);

    setForm({
      name: budget.name,
      amount: String(budget.amount),
      month: budget.month,
      year: budget.year,
      categoryId: budget.categoryId,
    });

    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (budget: Budget) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${budget.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await apiRequest<ApiResponse<Budget>>(
        `/budgets/${budget.id}`,
        { method: "DELETE" }
      );

      setSuccess("Budget deleted successfully");

      if (editingId === budget.id) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete budget"
      );
    }
  };

  // Calculate spending from real transactions
  const budgetsWithProgress: BudgetWithProgress[] = budgets.map(
    (budget) => {
      const spent = transactions
        .filter((transaction) => {
          const transactionDate = new Date(transaction.date);

          return (
            transaction.type === "EXPENSE" &&
            transaction.categoryId === budget.categoryId &&
            transactionDate.getUTCMonth() + 1 === budget.month &&
            transactionDate.getUTCFullYear() === budget.year
          );
        })
        .reduce(
          (total, transaction) => total + Number(transaction.amount),
          0
        );

      const budgetAmount = Number(budget.amount);
      const remaining = budgetAmount - spent;

      const percentage =
        budgetAmount > 0
          ? Math.round((spent / budgetAmount) * 100)
          : 0;

      return {
        ...budget,
        spent,
        remaining,
        percentage,
      };
    }
  );

  const totalBudget = budgetsWithProgress.reduce(
    (total, budget) => total + Number(budget.amount),
    0
  );

  const totalSpent = budgetsWithProgress.reduce(
    (total, budget) => total + budget.spent,
    0
  );

  const totalRemaining = totalBudget - totalSpent;

  const expenseCategories = categories.filter(
    (category) => category.type === "EXPENSE"
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const years = Array.from(
    { length: 7 },
    (_, index) => currentDate.getFullYear() - 3 + index
  );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Budgets
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Plan your spending and manage your monthly budgets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setError("");
            setSuccess("");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Budget
        </button>
      </div>

      {/* MONTH AND YEAR FILTER */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <CalendarDays size={20} className="text-slate-500" />

        <span className="text-sm font-medium text-slate-700">
          Select Period:
        </span>

        <select
          value={selectedMonth}
          onChange={(event) => {
            setSelectedMonth(Number(event.target.value));
            resetForm();
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          {months.map((month, index) => (
            <option key={month} value={index + 1}>
              {month}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(event) => {
            setSelectedYear(Number(event.target.value));
            resetForm();
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Close success"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Budget</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(totalBudget)}
              </h2>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Spent</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(totalSpent)}
              </h2>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Remaining Budget</p>
              <h2
                className={`mt-2 text-2xl font-bold ${
                  totalRemaining < 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {formatCurrency(totalRemaining)}
              </h2>
            </div>
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT FORM */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? "Edit Budget" : "Create New Budget"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Set a spending limit for an expense category.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              aria-label="Cancel editing"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="budgetName"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Budget Name
            </label>
            <input
              id="budgetName"
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="e.g. Monthly Food Budget"
              maxLength={100}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="budgetAmount"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Budget Amount ($)
            </label>
            <input
              id="budgetAmount"
              type="number"
              min="0.01"
              max="9999999999.99"
              step="0.01"
              value={form.amount}
              onChange={(event) =>
                setForm({ ...form, amount: event.target.value })
              }
              placeholder="e.g. 500.00"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="budgetCategory"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Expense Category
            </label>
            <select
              id="budgetCategory"
              value={form.categoryId}
              onChange={(event) =>
                setForm({ ...form, categoryId: event.target.value })
              }
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select category</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {expenseCategories.length === 0 && (
              <p className="mt-2 text-xs text-red-500">
                Create an expense category before creating a budget.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="budgetMonth"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Month
              </label>
              <select
                id="budgetMonth"
                value={form.month}
                onChange={(event) =>
                  setForm({
                    ...form,
                    month: Number(event.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
              >
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="budgetYear"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Year
              </label>
              <select
                id="budgetYear"
                value={form.year}
                onChange={(event) =>
                  setForm({
                    ...form,
                    year: Number(event.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-end gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={saving || expenseCategories.length === 0}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Budget"
                  : "Create Budget"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* BUDGET PROGRESS */}
      <div>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Budget Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track how much you have spent in each category.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <Loader2 size={30} className="animate-spin text-blue-600" />
          </div>
        ) : budgetsWithProgress.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Wallet className="mx-auto text-slate-400" size={42} />
            <h3 className="mt-4 font-semibold text-slate-800">
              No budgets for this period
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Create a budget to start tracking your spending.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {budgetsWithProgress.map((budget) => {
              const exceeded = budget.remaining < 0;
              const progressWidth = Math.min(budget.percentage, 100);

              return (
                <div
                  key={budget.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-11 w-11 rounded-xl"
                        style={{
                          backgroundColor: budget.category.color,
                        }}
                      />
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {budget.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {budget.category.name} · {months[budget.month - 1]}{" "}
                          {budget.year}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(budget)}
                        aria-label={`Edit ${budget.name}`}
                        className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDelete(budget)}
                        aria-label={`Delete ${budget.name}`}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Spent</p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {formatCurrency(budget.spent)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">Budget</p>
                      <p className="mt-1 font-semibold text-slate-700">
                        {formatCurrency(Number(budget.amount))}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        exceeded ? "bg-red-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span
                      className={`font-semibold ${
                        exceeded ? "text-red-600" : "text-slate-600"
                      }`}
                    >
                      {budget.percentage}% used
                    </span>

                    <span
                      className={`font-semibold ${
                        exceeded ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {exceeded ? "Over budget: " : "Remaining: "}
                      {formatCurrency(Math.abs(budget.remaining))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
