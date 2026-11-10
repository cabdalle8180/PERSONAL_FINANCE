
import express from "express";

import {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} from "../controllers/budgetController.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// JWT Authentication
router.use(protect);

// Budget CRUD
router.post("/", createBudget);
router.get("/", getBudgets);
router.get("/:id", getBudgetById);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

export default router;
