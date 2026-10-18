import mongoose from "mongoose";

const stationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    chargingPorts: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

stationSchema.index({ location: "2dsphere" });

export default mongoose.model("Station", stationSchema);