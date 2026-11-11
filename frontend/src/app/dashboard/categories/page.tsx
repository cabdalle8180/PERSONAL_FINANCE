
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  FolderOpen,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type CategoryType = "INCOME" | "EXPENSE";

interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  createdAt: string;
}

interface CategoriesResponse {
  success: boolean;
  categories: Category[];
  message?: string;
}

interface CategoryResponse {
  success: boolean;
  category: Category;
  message?: string;
}

interface ApiError {
  success: false;
  message: string;
}

interface CategoryForm {
  name: string;
  type: CategoryType;
  color: string;
}

const initialForm: CategoryForm = {
  name: "",
  type: "EXPENSE",
  color: "#64748b",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | CategoryType>("ALL");
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

    const data = (await response.json()) as T | ApiError;

    if (!response.ok) {
      throw new Error(
        "message" in data ? data.message : "Something went wrong"
      );
    }

    return data as T;
  };

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<CategoriesResponse>("/categories");

      setCategories(data.categories);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        await apiRequest<CategoryResponse>(`/categories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({
            name: form.name.trim(),
            type: form.type,
            color: form.color,
          }),
        });

        setSuccess("Category updated successfully");
      } else {
        await apiRequest<CategoryResponse>("/categories", {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            type: form.type,
            color: form.color,
          }),
        });

        setSuccess("Category created successfully");
      }

      resetForm();
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save category"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      type: category.type,
      color: category.color,
    });
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await apiRequest<{ success: boolean; message: string }>(
        `/categories/${category.id}`,
        { method: "DELETE" }
      );

      setSuccess("Category deleted successfully");

      if (editingId === category.id) {
        resetForm();
      }

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category"
      );
    }
  };

  const filteredCategories =
    filter === "ALL"
      ? categories
      : categories.filter((category) => category.type === filter);

  const incomeCount = categories.filter(
    (category) => category.type === "INCOME"
  ).length;

  const expenseCount = categories.filter(
    (category) => category.type === "EXPENSE"
  ).length;

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Categories
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Organize your income and expenses into categories.
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
          Add Category
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Categories</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {categories.length}
              </h2>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <FolderOpen size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Income Categories</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {incomeCount}
              </h2>
            </div>
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Expense Categories</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {expenseCount}
              </h2>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* ERROR AND SUCCESS */}
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
            aria-label="Close success message"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* CATEGORY FORM */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? "Edit Category" : "Create New Category"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editingId
                ? "Update your category information."
                : "Add a category to organize your transactions."}
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Cancel editing"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="categoryName"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Category Name
            </label>
            <input
              id="categoryName"
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="e.g. Food, Salary, Transport"
              maxLength={50}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="categoryType"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Category Type
            </label>
            <select
              id="categoryType"
              value={form.type}
              onChange={(event) =>
                setForm({
                  ...form,
                  type: event.target.value as CategoryType,
                })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="categoryColor"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Category Color
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-3 py-2">
              <input
                id="categoryColor"
                type="color"
                value={form.color}
                onChange={(event) =>
                  setForm({ ...form, color: event.target.value })
                }
                className="h-9 w-12 cursor-pointer border-0 bg-transparent"
              />
              <span className="text-sm font-medium text-slate-600">
                {form.color}
              </span>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <button
              type="submit"
              disabled={saving}
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
                  ? "Update Category"
                  : "Create Category"}
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

      {/* FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Your Categories
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage all your categories.
          </p>
        </div>

        <div className="flex gap-2">
          {(["ALL", "INCOME", "EXPENSE"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === item
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item === "ALL"
                ? "All"
                : item === "INCOME"
                  ? "Income"
                  : "Expense"}
            </button>
          ))}
        </div>
      </div>

      {/* CATEGORY LIST */}
      {loading ? (
        <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-16">
          <Loader2 size={30} className="animate-spin text-blue-600" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <FolderOpen className="mx-auto text-slate-400" size={42} />
          <h3 className="mt-4 font-semibold text-slate-800">
            No categories found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Create your first category using the form above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-xl"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {category.name}
                    </h3>
                    <span
                      className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        category.type === "INCOME"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {category.type === "INCOME" ? "Income" : "Expense"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-400">
                  {category.color}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(category)}
                    aria-label={`Edit ${category.name}`}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(category)}
                    aria-label={`Delete ${category.name}`}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
