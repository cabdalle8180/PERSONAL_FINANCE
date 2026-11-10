
import prisma from "../../prisma.js";

// Validate monetary amount
const isValidAmount = (amount) => {
  if (
    (typeof amount !== "string" && typeof amount !== "number") ||
    !/^\d{1,10}(\.\d{1,2})?$/.test(String(amount))
  ) {
    return false;
  }

  return Number(amount) > 0;
};

// Validate month and year
const isValidPeriod = (month, year) => {
  return (
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12 &&
    Number.isInteger(year) &&
    year >= 2000 &&
    year <= 9999
  );
};


// CREATE BUDGET
export const createBudget = async (req, res) => {
  try {
    const { name, amount, month, year, categoryId } = req.body ?? {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !isValidAmount(amount) ||
      !isValidPeriod(month, year) ||
      typeof categoryId !== "string" ||
      !categoryId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid name, amount, month, year and categoryId are required",
      });
    }

    // Check category ownership
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

    const budget = await prisma.budget.create({
      data: {
        name: name.trim(),
        amount: String(amount),
        month,
        year,
        userId: req.userId,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Budget created successfully",
      budget,
    });

  } catch (error) {
    console.error("Create budget error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A budget already exists for this category and month",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET ALL BUDGETS
export const getBudgets = async (req, res) => {
  try {
    const { month, year, categoryId } = req.query;

    const where = {
      userId: req.userId,
    };

    if (month !== undefined) {
      const parsedMonth = Number(month);

      if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({
          success: false,
          message: "Month must be between 1 and 12",
        });
      }

      where.month = parsedMonth;
    }

    if (year !== undefined) {
      const parsedYear = Number(year);

      if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 9999) {
        return res.status(400).json({
          success: false,
          message: "Invalid year",
        });
      }

      where.year = parsedYear;
    }

    if (categoryId !== undefined) {
      if (typeof categoryId !== "string" || !categoryId.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId",
        });
      }

      where.categoryId = categoryId;
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { createdAt: "desc" },
      ],
    });

    return res.status(200).json({
      success: true,
      count: budgets.length,
      budgets,
    });

  } catch (error) {
    console.error("Get budgets error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET SINGLE BUDGET
export const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: req.userId,
      },
      include: {
        category: true,
      },
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    return res.status(200).json({
      success: true,
      budget,
    });

  } catch (error) {
    console.error("Get budget error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// UPDATE BUDGET
export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, month, year, categoryId } = req.body ?? {};

    if (
      name === undefined &&
      amount === undefined &&
      month === undefined &&
      year === undefined &&
      categoryId === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Name must be a non-empty string",
      });
    }

    if (amount !== undefined && !isValidAmount(amount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingBudget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    const newMonth = month ?? existingBudget.month;
    const newYear = year ?? existingBudget.year;

    if (!isValidPeriod(newMonth, newYear)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month or year",
      });
    }

    const newCategoryId = categoryId ?? existingBudget.categoryId;

    if (
      categoryId !== undefined &&
      (typeof categoryId !== "string" || !categoryId.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid categoryId",
      });
    }

    // Check category belongs to this user
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

    const budget = await prisma.budget.update({
      where: {
        id,
        userId: req.userId,
      },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(amount !== undefined && { amount: String(amount) }),
        ...(month !== undefined && { month }),
        ...(year !== undefined && { year }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: {
        category: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      budget,
    });

  } catch (error) {
    console.error("Update budget error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A budget already exists for this category and month",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// DELETE BUDGET
export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingBudget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    await prisma.budget.delete({
      where: {
        id,
        userId: req.userId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });

  } catch (error) {
    console.error("Delete budget error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
