export interface TransactionCategory {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
}

export interface Transaction {
  id: string;
  amount: string;
  type: "INCOME" | "EXPENSE";
  description: string | null;
  date: string;
  categoryId: string;
  category: TransactionCategory;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsResponse {
  success: boolean;
  count: number;
  transactions: Transaction[];
}