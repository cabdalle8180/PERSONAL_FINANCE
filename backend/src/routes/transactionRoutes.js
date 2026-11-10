
import express from "express";

import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// JWT Authentication
router.use(protect);

// Transaction CRUD
router.post("/", createTransaction);
router.get("/", getTransactions);
router.get("/:id", getTransactionById);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
