import mongoose from "mongoose";

const landSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, default: "" },
    size: { type: String, default: "" },
    ownershipDocs: { type: String, default: "" },
    status: {
      type: String,
      enum: ["available", "developed", "leased", "sold"],
      default: "available",
    },
    value: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Land = mongoose.model("Land", landSchema);
