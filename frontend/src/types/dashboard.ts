export interface DashboardSummary {
  totalIncome: string;
  totalExpenses: string;
  balance: string;
  incomeCount: number;
  expenseCount: number;
}

export interface DashboardCategory {
  id: string;
  name: string;
  type: string;
  color: string;
}

export interface BudgetProgress {
  id: string;
  name: string;
  category: DashboardCategory;
  budgetAmount: string;
  spentAmount: string;
  remainingAmount: string;
  percentage: number;
  isExceeded: boolean;
}

export interface RecentTransaction {
  id: string;
  amount: string;
  type: "INCOME" | "EXPENSE";
  description: string | null;
  date: string;
  category: DashboardCategory;
}

export interface DashboardData {
  period: {
    month: number;
    year: number;
  };
  summary: DashboardSummary;
  budgetProgress: BudgetProgress[];
  recentTransactions: RecentTransaction[];
}

export interface DashboardResponse {
  success: boolean;
  dashboard: DashboardData;
}