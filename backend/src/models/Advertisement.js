import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Apartment" },
    propertyName: { type: String, default: "" },
    unitType: { type: String, default: "" },
    rentAmount: { type: Number, default: 0 },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected", "archived"],
      default: "draft",
    },
    published: { type: Boolean, default: false },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Advertisement = mongoose.model("Advertisement", advertisementSchema);
