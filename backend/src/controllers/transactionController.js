import prisma from "../../prisma.js";

// Helper: Validate monetary amount (up to 10 digits + 2 decimals)
const isValidAmount = (amount) => {
  if (
    (typeof amount !== "string" && typeof amount !== "number") ||
    !/^\d{1,10}(\.\d{1,2})?$/.test(String(amount))
  ) {
    return false;
  }

  return Number(amount) > 0;
};

// CREATE TRANSACTION
export const createTransaction = async (req, res) => {
  try {
    const { amount, type, description, date, categoryId } = req.body ?? {};

    if (!isValidAmount(amount)) {
      return res.status(400).json({
        success: false,
        message: "Amount must be positive and have at most 2 decimal places",
      });
    }

    if (
      typeof type !== "string" ||
      !type.trim() ||
      typeof categoryId !== "string" ||
      !categoryId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Type and categoryId are required",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string",
      });
    }

    const transactionDate = date === undefined
      ? undefined
      : new Date(date);

    if (
      date !== undefined &&
      (typeof date !== "string" || !Number.isFinite(transactionDate.getTime()))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction date",
      });
    }

    // Verify category belongs to authenticated user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: req.userId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Category type must match transaction type
    if (category.type !== type.trim()) {
      return res.status(400).json({
        success: false,
        message: "Transaction type must match category type",
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: String(amount),
        type: type.trim(),
        description:
          typeof description === "string"
            ? description.trim() || null
            : null,
        ...(transactionDate && { date: transactionDate }),
        userId: req.userId,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
    });

  } catch (error) {
    console.error("Create transaction error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET ALL TRANSACTIONS
export const getTransactions = async (req, res) => {
  try {
    const { type, categoryId, startDate, endDate } = req.query;

    const where = {
      userId: req.userId,
    };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;

    if (startDate || endDate) {
      where.date = {};

      if (startDate) {
        const start = new Date(startDate);

        if (!Number.isFinite(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid startDate",
          });
        }

        where.date.gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);

        if (!Number.isFinite(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid endDate",
          });
        }

        where.date.lte = end;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });

  } catch (error) {
    console.error("Get transactions error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET SINGLE TRANSACTION
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.userId,
      },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      success: true,
      transaction,
    });

  } catch (error) {
    console.error("Get transaction error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// UPDATE TRANSACTION
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, description, date, categoryId } = req.body ?? {};

    if (
      amount === undefined &&
      type === undefined &&
      description === undefined &&
      date === undefined &&
      categoryId === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    if (amount !== undefined && !isValidAmount(amount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    if (
      type !== undefined &&
      (typeof type !== "string" || !type.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction type",
      });
    }

    if (
      categoryId !== undefined &&
      (typeof categoryId !== "string" || !categoryId.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid categoryId",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string",
      });
    }

    let transactionDate;

    if (date !== undefined) {
      if (typeof date !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid transaction date",
        });
      }

      transactionDate = new Date(date);

      if (!Number.isFinite(transactionDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid transaction date",
        });
      }
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const newCategoryId = categoryId ?? existingTransaction.categoryId;
    const newType = type?.trim() ?? existingTransaction.type;

    // Verify category ownership and type
    const category = await prisma.category.findFirst({
      where: {
        id: newCategoryId,
        userId: req.userId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.type !== newType) {
      return res.status(400).json({
        success: false,
        message: "Transaction type must match category type",
      });
    }

    const transaction = await prisma.transaction.update({
      where: {
        id,
        userId: req.userId,
      },
      data: {
        ...(amount !== undefined && { amount: String(amount) }),
        ...(type !== undefined && { type: newType }),
        ...(description !== undefined && {
          description:
            typeof description === "string"
              ? description.trim() || null
              : null,
        }),
        ...(date !== undefined && { date: transactionDate }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: {
        category: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });

  } catch (error) {
    console.error("Update transaction error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// DELETE TRANSACTION
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await prisma.transaction.delete({
      where: {
        id,
        userId: req.userId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });

  } catch (error) {
    console.error("Delete transaction error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};