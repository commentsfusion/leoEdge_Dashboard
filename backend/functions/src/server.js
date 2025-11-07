import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import functions from "firebase-functions";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import employeeRoutes from "./routes/employee.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import salaryRoutes from "./routes/salaryRoutes.js";
// import employeeSalaryRoutes from "./routes/employeeSalary.js";

dotenv.config();

const app = express();

// connect to MongoDB (will use .env locally, firebase config in cloud if you code it in db.js)
await connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/add-employee", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/salary", salaryRoutes);
// app.use("/api/employee-salary", employeeSalaryRoutes);

// ❌ don't do app.listen(...) in Firebase
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 API listening on ${PORT}`));

// ✅ instead export as a cloud function
export const api = functions.https.onRequest(app);
