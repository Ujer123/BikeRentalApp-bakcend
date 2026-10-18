import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bike: { type: mongoose.Schema.Types.ObjectId, ref: "Bike", required: true },
    startStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      default: null,
    },
    endStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      default: null,
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    durationMin: { type: Number, default: 0 },
    distanceKm: { type: Number, default: 0 },
    unlockFee: { type: Number, default: 0 },
    rideCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Rental", rentalSchema);