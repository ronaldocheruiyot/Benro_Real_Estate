import mongoose from "mongoose";

const maintenanceTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    apartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Apartment" },
    unit: { type: String, default: "" },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    cost: { type: Number, default: 0 },
    images: [{ type: String }],
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const MaintenanceTask = mongoose.model("MaintenanceTask", maintenanceTaskSchema);
