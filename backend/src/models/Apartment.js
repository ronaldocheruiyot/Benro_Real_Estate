import mongoose from "mongoose";

const apartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    address: { type: String, default: "" },
    hasUnitsConfigured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "pending", "inactive"],
      default: "active",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Apartment = mongoose.model("Apartment", apartmentSchema);
