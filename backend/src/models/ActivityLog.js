import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    action: { type: String, required: true },
    targetType: {
      type: String,
      enum: ["tenant", "payment", "apartment", "unit", "user", "document", "advertisement", "system"],
      default: "system",
    },
    targetId: { type: String, default: "" },
    targetName: { type: String, default: "" },
    details: { type: String, default: "" },
    apartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Apartment" },
    timestamp: { type: String, default: () => new Date().toISOString() },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export async function logActivity(payload) {
  try {
    await ActivityLog.create(payload);
  } catch (err) {
    console.error("Failed to write activity log", err.message);
  }
}
