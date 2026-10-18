import express from "express";
import Bike from "../models/Bike.js";
import Rental from "../models/Rental.js";
import User from "../models/User.js";
import Station from "../models/Station.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET /api/admin/stats — overview cards for the web dashboard
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const [
      totalBikes,
      availableBikes,
      rentedBikes,
      chargingBikes,
      totalUsers,
      activeRentals,
      totalStations,
      revenueAgg,
    ] = await Promise.all([
      Bike.countDocuments(),
      Bike.countDocuments({ status: "available" }),
      Bike.countDocuments({ status: "rented" }),
      Bike.countDocuments({ status: "charging" }),
      User.countDocuments({ role: "rider" }),
      Rental.countDocuments({ status: "active" }),
      Station.countDocuments(),
      Rental.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalCost" } } },
      ]),
    ]);

    res.json({
      totalBikes,
      availableBikes,
      rentedBikes,
      chargingBikes,
      totalUsers,
      activeRentals,
      totalStations,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/rentals — all rentals with filters (dashboard table)
router.get("/rentals", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const rentals = await Rental.find(filter)
      .populate("user", "name email")
      .populate("bike", "name")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users — all riders
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: "rider" }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;