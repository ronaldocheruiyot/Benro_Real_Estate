import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["lease", "ownership", "permit", "id", "other"],
      default: "other",
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    size: { type: Number, default: 0 },
    apartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Apartment" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema);
