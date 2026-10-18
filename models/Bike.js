import mongoose from "mongoose";

const bikeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qrCode: { type: String, unique: true, required: true }, // scanned to unlock
    status: {
      type: String,
      enum: ["available", "rented", "charging", "maintenance"],
      default: "available",
    },
    batteryPercent: { type: Number, default: 100, min: 0, max: 100 },
    rangeKm: { type: Number, required: true },
    topSpeedKmh: { type: Number, default: 25 },
    motorPowerW: { type: Number, default: 250 },
    weightKg: { type: Number, default: 22 },
    fullChargeHours: { type: Number, default: 3 },
    pricePerMin: { type: Number, required: true },
    unlockFee: { type: Number, default: 0 },
    features: [String],
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      default: null,
    },
  },
  { timestamps: true }
);

bikeSchema.index({ location: "2dsphere" }); // for geospatial map queries

export default mongoose.model("Bike", bikeSchema);