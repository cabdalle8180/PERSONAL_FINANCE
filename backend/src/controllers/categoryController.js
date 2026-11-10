
import prisma from "../../prisma.js";

// CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { name, type, color } = req.body ?? {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof type !== "string" ||
      !type.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name and type are required",
      });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        type: type.trim(),
        color:
          typeof color === "string" && color.trim()
            ? color.trim()
            : "#64748b",
        userId: req.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Category already exists for this type",
      });
    }

    if (error.code === "P2009" || error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid category data",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET ALL CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET SINGLE CATEGORY
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, color } = req.body ?? {};

    if (
      name === undefined &&
      type === undefined &&
      color === undefined
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

    if (
      type !== undefined &&
      (typeof type !== "string" || !type.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Type must be a non-empty string",
      });
    }

    if (
      color !== undefined &&
      (typeof color !== "string" || !color.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Color must be a non-empty string",
      });
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(type !== undefined && { type: type.trim() }),
        ...(color !== undefined && { color: color.trim() }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Category already exists for this type",
      });
    }

    if (error.code === "P2009") {
      return res.status(400).json({
        success: false,
        message: "Invalid category data",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
