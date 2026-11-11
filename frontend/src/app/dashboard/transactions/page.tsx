"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

type TransactionType = "INCOME" | "EXPENSE";

interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
}

interface Transaction {
  id: string;
  amount: string;
  type: TransactionType;
  description: string | null;
  date: string;
  categoryId: string;
  category: Category;
}

interface TransactionsResponse {
  success: boolean;
  count: number;
  transactions: Transaction[];
}

interface CategoriesResponse {
  success: boolean;
  categories: Category[];
}

interface TransactionForm {
  amount: string;
  type: TransactionType;
  description: string;
  date: string;
  categoryId: string;
}

const initialForm: TransactionForm = {
  amount: "",
  type: "EXPENSE",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  categoryId: "",
};

export default function TransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState<TransactionForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [transactionData, categoryData] = await Promise.all([
        apiRequest<TransactionsResponse>("/transactions", { headers }),
        apiRequest<CategoriesResponse>("/categories", { headers }),
      ]);

      setTransactions(transactionData.transactions);
      setCategories(categoryData.categories);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transactions"
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredCategories = categories.filter(
    (category) => category.type === form.type
  );

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "ALL") return true;
    return transaction.type === filter;
  });

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleTypeChange = (type: TransactionType) => {
    setForm((previous) => ({
      ...previous,
      type,
      categoryId: "",
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        amount: form.amount,
        type: form.type,
        description: form.description,
        date: form.date,
        categoryId: form.categoryId,
      };

      const options = {
        method: editingId ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      };

      if (editingId) {
        await apiRequest(`/transactions/${editingId}`, options);
        setSuccess("Transaction updated successfully.");
      } else {
        await apiRequest("/transactions", options);
        setSuccess("Transaction created successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save transaction"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setForm({
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description ?? "",
      date: new Date(transaction.date).toISOString().slice(0, 10),
      categoryId: transaction.categoryId,
    });

    setEditingId(transaction.id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    // Use the same storage as Login and AuthGuard.
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");
      setSuccess("");

      await apiRequest(`/transactions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Transaction deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete transaction"
      );
    }
  };

  const formatAmount = (amount: string) =>
    Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading transactions...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">

      {/* Header */}
      <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Transactions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your income and expenses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
            setError("");
            setSuccess("");
          }}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div
          role="alert"
          className="break-words rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600 sm:p-4"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="break-words rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-green-700 sm:p-4"
        >
          {success}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              {editingId ? "Edit Transaction" : "New Transaction"}
            </h2>

            <button
              type="button"
              onClick={resetForm}
              aria-label="Close form"
              className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Transaction Type
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange("EXPENSE")}
                  aria-pressed={form.type === "EXPENSE"}
                  className={`rounded-lg border p-3 text-sm font-medium transition sm:text-base ${
                    form.type === "EXPENSE"
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Expense
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange("INCOME")}
                  aria-pressed={form.type === "INCOME"}
                  className={`rounded-lg border p-3 text-sm font-medium transition sm:text-base ${
                    form.type === "INCOME"
                      ? "border-green-500 bg-green-50 text-green-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Amount */}
              <div className="min-w-0">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Amount ($)
                </label>

                <input
                  type="number"
                  required
                  min="0.01"
                  max="9999999999.99"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amount: event.target.value,
                    })
                  }
                  placeholder="0.00"
                  className="w-full min-w-0 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Category */}
              <div className="min-w-0">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category
                </label>

                <select
                  required
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      categoryId: event.target.value,
                    })
                  }
                  className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select category</option>

                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {filteredCategories.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600 sm:text-sm">
                    No {form.type.toLowerCase()} categories found.
                    Create a category first.
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="min-w-0">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <input
                  type="text"
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  placeholder="What was this transaction for?"
                  className="w-full min-w-0 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Date */}
              <div className="min-w-0">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Date
                </label>

                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      date: event.target.value,
                    })
                  }
                  className="w-full min-w-0 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button
                type="submit"
                disabled={saving || filteredCategories.length === 0}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Transaction"
                    : "Save Transaction"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "INCOME", "EXPENSE"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            aria-pressed={filter === item}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
              filter === item
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {item === "ALL"
              ? "All Transactions"
              : item === "INCOME"
                ? "Income"
                : "Expenses"}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
            Transaction History ({filteredTransactions.length})
          </h2>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center sm:p-10">
            <p className="text-sm font-medium text-slate-700">
              No transactions found.
            </p>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Add your first transaction to get started.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-4 font-medium sm:px-5">
                    Transaction
                  </th>

                  <th className="whitespace-nowrap px-4 py-4 font-medium sm:px-5">
                    Category
                  </th>

                  <th className="whitespace-nowrap px-4 py-4 font-medium sm:px-5">
                    Date
                  </th>

                  <th className="whitespace-nowrap px-4 py-4 font-medium sm:px-5">
                    Type
                  </th>

                  <th className="whitespace-nowrap px-4 py-4 text-right font-medium sm:px-5">
                    Amount
                  </th>

                  <th className="whitespace-nowrap px-4 py-4 text-center font-medium sm:px-5">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="max-w-[200px] px-4 py-4 sm:px-5">
                      <div className="truncate font-medium text-slate-800">
                        {transaction.description || "No description"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-slate-600 sm:px-5">
                      {transaction.category.name}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-slate-500 sm:px-5">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 sm:px-5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium sm:px-3 ${
                          transaction.type === "INCOME"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {transaction.type === "INCOME" ? (
                          <ArrowUpCircle size={14} />
                        ) : (
                          <ArrowDownCircle size={14} />
                        )}

                        {transaction.type}
                      </span>
                    </td>

                    <td
                      className={`whitespace-nowrap px-4 py-4 text-right font-semibold sm:px-5 ${
                        transaction.type === "INCOME"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}$
                      {formatAmount(transaction.amount)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 sm:px-5">
                      <div className="flex justify-center gap-1 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(transaction)}
                          title="Edit transaction"
                          aria-label="Edit transaction"
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(transaction.id)}
                          title="Delete transaction"
                          aria-label="Delete transaction"
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
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
