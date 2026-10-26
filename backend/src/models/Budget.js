import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, default: "maintenance" },
    apartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Apartment" },
    amount: { type: Number, required: true, min: 0 },
    spent: { type: Number, default: 0 },
    period: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
    },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Budget = mongoose.model("Budget", budgetSchema);
