// routes/employee.js
import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { protect, requireRole } from "../middleware/auth.js";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeById,
  deleteEmployeeById,
} from "../controllers/employee.controller.js";

const router = Router();

router.post("/", upload.single("image"), protect, requireRole("admin"), createEmployee);
router.get("/",protect, getAllEmployees);
router.get("/:employee_id",protect, getEmployeeById);
router.patch("/:employee_id", upload.single("image"), protect, requireRole("admin"), updateEmployeeById);
router.delete("/:employee_id",upload.single("image"), protect, requireRole("admin"), deleteEmployeeById);

export default router;  
