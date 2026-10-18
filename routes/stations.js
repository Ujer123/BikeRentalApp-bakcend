import express from "express";
import Station from "../models/Station.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET /api/stations?lat=..&lng=.. — charging stations near user
router.get("/", protect, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const filter = { isActive: true };
    if (lat && lng) {
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 20000,
        },
      };
    }
    const stations = await Station.find(filter);
    res.json(stations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin CRUD
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Station.findByIdAndDelete(req.params.id);
    res.json({ message: "Station removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;