import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import userRoutes from "./routes/userRoutes.js";
import guestRoutes from "./routes/guestRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import requirementRoutes from "./routes/requirementRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsDir));

// Test route
app.get("/", (req, res) => {
  res.send("Wedding Management Backend is running 🚀");
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/requirements", requirementRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
