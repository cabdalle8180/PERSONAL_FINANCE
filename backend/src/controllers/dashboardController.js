
import prisma from "../../prisma.js";

// GET DASHBOARD SUMMARY
export const getDashboard = async (req, res) => {
  try {
    // Current month and year (defaults)
    const currentDate = new Date();

    const month = req.query.month === undefined
      ? currentDate.getMonth() + 1
      : Number(req.query.month);

    const year = req.query.year === undefined
      ? currentDate.getFullYear()
      : Number(req.query.year);

    // Validate month and year
    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 9999
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid month or year",
      });
    }

    // Monthly date range (UTC)
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const userId = req.userId;

    // 1. Get monthly transaction totals by type
    const transactionTotals = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Extract INCOME and EXPENSE totals
    const incomeGroup = transactionTotals.find(
      (item) => item.type === "INCOME"
    );

    const expenseGroup = transactionTotals.find(
      (item) => item.type === "EXPENSE"
    );

    const totalIncome = incomeGroup?._sum.amount;
    const totalExpenses = expenseGroup?._sum.amount;

    // Decimal-safe balance calculation
    let balance = "0.00";

    if (totalIncome && totalExpenses) {
      balance = totalIncome.minus(totalExpenses).toFixed(2);
    } else if (totalIncome) {
      balance = totalIncome.toFixed(2);
    } else if (totalExpenses) {
      balance = totalExpenses.negated().toFixed(2);
    }

    // 2. Get monthly budgets
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Get expenses grouped by category
    const categoryIds = budgets.map(
      (budget) => budget.categoryId
    );

    const categoryExpenses = categoryIds.length > 0
      ? await prisma.transaction.groupBy({
          by: ["categoryId"],
          where: {
            userId,
            categoryId: {
              in: categoryIds,
            },
            type: "EXPENSE",
            date: {
              gte: startDate,
              lt: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        })
      : [];

    // 4. Calculate budget progress
    const budgetProgress = budgets.map((budget) => {
      const spent = categoryExpenses.find(
        (item) => item.categoryId === budget.categoryId
      )?._sum.amount;

      const spentAmount = Number(spent?.toFixed(2) ?? "0.00");
      const budgetAmount = Number(budget.amount.toFixed(2));

      const percentage = budgetAmount > 0
        ? Number(((spentAmount / budgetAmount) * 100).toFixed(2))
        : 0;

      return {
        id: budget.id,
        name: budget.name,
        category: budget.category,
        budgetAmount: budget.amount.toFixed(2),
        spentAmount: spentAmount.toFixed(2),
        remainingAmount: (budgetAmount - spentAmount).toFixed(2),
        percentage,
        isExceeded: spentAmount > budgetAmount,
      };
    });

    // 5. Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
    });

    // 6. Return dashboard response
    return res.status(200).json({
      success: true,
      dashboard: {
        period: {
          month,
          year,
        },

        summary: {
          totalIncome: totalIncome?.toFixed(2) ?? "0.00",
          totalExpenses: totalExpenses?.toFixed(2) ?? "0.00",
          balance,
          incomeCount: incomeGroup?._count.id ?? 0,
          expenseCount: expenseGroup?._count.id ?? 0,
        },

        budgetProgress,

        recentTransactions,
      },
    });

  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
