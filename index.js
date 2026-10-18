import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

// Import all routes using ES Module import syntax
import authRoutes from "./routes/auth.js";
import bikeRoutes from "./routes/bikes.js";
import stationRoutes from "./routes/stations.js";
import rentalRoutes from "./routes/rentals.js";
import notificationRoutes from "./routes/notifications.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 VoltRide API running on http://localhost:${PORT}`)
  );
});