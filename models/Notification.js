import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["offer", "new_bike", "ride", "system"],
      default: "system",
    },
    bike: { type: mongoose.Schema.Types.ObjectId, ref: "Bike", default: null },
    target: {
      type: String,
      enum: ["all", "user"],
      default: "all",
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);