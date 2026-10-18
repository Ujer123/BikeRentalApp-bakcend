import express from "express";
import Rental from "../models/Rental.js";
import Bike from "../models/Bike.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// POST /api/rentals/start — scan QR / book a bike
router.post("/start", protect, async (req, res) => {
  try {
    const { bikeId } = req.body;

    // One active rental per user
    const existing = await Rental.findOne({
      user: req.user._id,
      status: "active",
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You already have an active rental" });
    }

    const bike = await Bike.findById(bikeId);
    if (!bike) return res.status(404).json({ message: "Bike not found" });
    if (bike.status !== "available") {
      return res
        .status(400)
        .json({ message: `Bike is ${bike.status}, cannot rent` });
    }
    if (bike.batteryPercent < 15) {
      return res
        .status(400)
        .json({ message: "Bike battery too low, pick another" });
    }

    // Check wallet balance covers unlock fee at minimum
    const user = await User.findById(req.user._id);
    if (user.walletBalance < bike.unlockFee) {
      return res
        .status(400)
        .json({ message: "Insufficient wallet balance, please top up" });
    }

    bike.status = "rented";
    await bike.save();

    const rental = await Rental.create({
      user: req.user._id,
      bike: bike._id,
      startStation: bike.station,
      unlockFee: bike.unlockFee,
    });

    const populated = await rental.populate("bike", "name batteryPercent pricePerMin");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/rentals/:id/end — return bike, compute cost
router.post("/:id/end", protect, async (req, res) => {
  try {
    const { endStationId, distanceKm = 0 } = req.body;
    const rental = await Rental.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "active",
    });
    if (!rental) {
      return res.status(404).json({ message: "No active rental found" });
    }

    const bike = await Bike.findById(rental.bike);
    const endedAt = new Date();
    const durationMin = Math.max(
      1,
      Math.ceil((endedAt - rental.startedAt) / 60000)
    );
    const rideCost = durationMin * bike.pricePerMin;
    const totalCost = rideCost + rental.unlockFee;

    rental.endedAt = endedAt;
    rental.durationMin = durationMin;
    rental.distanceKm = distanceKm;
    rental.rideCost = Number(rideCost.toFixed(2));
    rental.totalCost = Number(totalCost.toFixed(2));
    rental.status = "completed";
    rental.endStation = endStationId || null;
    await rental.save();

    // Free the bike
    bike.status = "available";
    bike.batteryPercent = Math.max(
      0,
      bike.batteryPercent - Math.round(distanceKm * 1.5) // rough drain estimate
    );
    await bike.save();

    // Deduct from wallet
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { walletBalance: -totalCost },
    });

    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rentals/active — user's current rental (for "Active Rentals" page + timer)
router.get("/active", protect, async (req, res) => {
  try {
    const rental = await Rental.findOne({
      user: req.user._id,
      status: "active",
    }).populate("bike", "name batteryPercent pricePerMin image");
    res.json(rental); // null if none
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rentals/history — past rentals (Rental History page)
router.get("/history", protect, async (req, res) => {
  try {
    const rentals = await Rental.find({
      user: req.user._id,
      status: "completed",
    })
      .populate("bike", "name image")
      .populate("startStation", "name")
      .populate("endStation", "name")
      .sort({ endedAt: -1 });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;