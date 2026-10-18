import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["rider", "admin"], default: "rider" },
    membership: {
      type: String,
      enum: ["Free", "Silver", "Gold"],
      default: "Free",
    },
    avatar: { type: String, default: "" },
    walletBalance: { type: Number, default: 0 },
    favoriteBikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bike" }],
    fcmToken: { type: String, default: "" }, // for push notifications later
  },
  { timestamps: true }
)

export default mongoose.model("User", userSchema);