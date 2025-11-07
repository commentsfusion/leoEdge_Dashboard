// routes/salaryRoutes.js
import express from "express";
import {
  applySalaryAction,
  getEmployeeSalaryHistory,
  markSalaryPaid,
} from "../controllers/salaryController.js";
import { protect, requireRole } from "../middleware/auth.js";
const router = express.Router();

// POST body has all optional fields
router.post("/apply",protect, requireRole("admin"), applySalaryAction);

// GET history for 1 employee
router.get("/history/:employee_id", getEmployeeSalaryHistory);

// POST to mark paid
router.post("/mark-paid", protect, requireRole("admin"),markSalaryPaid);

export default router;
