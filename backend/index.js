import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./src/config/db.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// ----------------------------------------------------------------------
// ✅ CORS Setup (works locally & in production)
// ----------------------------------------------------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  // 👇 Add your deployed Firebase Functions v2 base URL
  "https://api-ffyxb55wzq-uc.a.run.app", // <-- replace with your actual one from console
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".a.run.app") // ✅ allow all Firebase Cloud Run instances
    ) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

// ----------------------------------------------------------------------
// ✅ MongoDB Connection
// ----------------------------------------------------------------------
(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
})();

// ----------------------------------------------------------------------
// ✅ Routes
// ----------------------------------------------------------------------
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/user.js";
import employeeRoutes from "./src/routes/employee.js";
import attendanceRoutes from "./src/routes/attendanceRoutes.js";
import salaryRoutes from "./src/routes/salaryRoutes.js";

// Static uploads
app.use("/uploads", express.static("./src/uploads"));

// Route registration
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/add-employee", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/salary", salaryRoutes);

// ----------------------------------------------------------------------
// ✅ Export Firebase Function
// ----------------------------------------------------------------------
export const api = onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  app
);
