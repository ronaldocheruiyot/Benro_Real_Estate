import mongoose from "mongoose";

const inspectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["move-in", "move-out", "routine", "emergency"],
      required: true,
    },
    apartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Apartment" },
    unit: { type: String, default: "" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    scheduledDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    conditionRating: { type: Number, min: 1, max: 5 },
    notes: { type: String, default: "" },
    meterReadings: {
      water: Number,
      electricity: Number,
      gas: Number,
    },
    images: [{ type: String }],
    conductedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Inspection = mongoose.model("Inspection", inspectionSchema);
