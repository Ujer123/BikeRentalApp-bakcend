import express from "express";
import Bike from "../models/Bike.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET /api/bikes?lat=..&lng=..&maxDist=5000 — list bikes, optionally near user
router.get("/", protect, async (req, res) => {
  try {
    const { lat, lng, maxDist = 10000, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    if (lat && lng) {
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDist),
        },
      };
    }
    const bikes = await Bike.find(filter).populate("station", "name address");
    res.json(bikes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bikes/:id — single bike
router.get("/:id", protect, async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id).populate(
      "station",
      "name address chargingPorts location"
    );
    if (!bike) return res.status(404).json({ message: "Bike not found" });
    res.json(bike);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bikes — admin adds a bike (dashboard)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const bike = await Bike.create(req.body);
    res.status(201).json(bike);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/bikes/:id — admin updates (battery, status, price, location)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const bike = await Bike.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!bike) return res.status(404).json({ message: "Bike not found" });
    res.json(bike);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/bikes/:id — admin removes bike
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Bike.findByIdAndDelete(req.params.id);
    res.json({ message: "Bike removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bikes/:id/favorite — toggle favorite
router.post("/:id/favorite", protect, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user._id);
    const idx = user.favoriteBikes.indexOf(req.params.id);
    if (idx > -1) user.favoriteBikes.splice(idx, 1);
    else user.favoriteBikes.push(req.params.id);
    await user.save();
    res.json({ favorites: user.favoriteBikes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;