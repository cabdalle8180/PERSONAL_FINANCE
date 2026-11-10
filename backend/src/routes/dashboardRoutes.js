
import express from "express";

import { getDashboard } from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// JWT Authentication
router.use(protect);

// Dashboard
router.get("/", getDashboard);

export default router;
