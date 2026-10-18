import express from "express";
import Notification from "../models/Notification.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET /api/notifications — my notifications (broadcast + personal)
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ target: "all" }, { recipient: req.user._id }],
    })
      .populate("bike", "name")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/read-all
router.put("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { $or: [{ target: "all" }, { recipient: req.user._id }] },
      { isRead: true }
    );
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notifications — admin sends offer / new bike announcement
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, body, type, bikeId, target = "all", recipient } = req.body;
    const notification = await Notification.create({
      title,
      body,
      type,
      bike: bikeId || null,
      target,
      recipient: target === "user" ? recipient : null,
    });
    // TODO: push via expo-notifications using user fcmTokens
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;