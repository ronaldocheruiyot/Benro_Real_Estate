import mongoose from "mongoose";

const chargeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    isOptional: { type: Boolean, default: false },
    type: { type: String, enum: ["fixed", "variable"], default: "fixed" },
  },
  { _id: false }
);

const unitSchema = new mongoose.Schema(
  {
    apartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Apartment", required: true, index: true },
    unitNumber: { type: String, required: true, trim: true },
    unitType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    baseRent: { type: Number, required: true, min: 0 },
    charges: { type: [chargeSchema], default: [] },
    status: { type: String, enum: ["occupied", "vacant"], default: "vacant" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", default: null },
    floor: { type: Number },
    squareFeet: { type: Number },
  },
  { timestamps: true }
);

unitSchema.index({ apartmentId: 1, unitNumber: 1 }, { unique: true });

export const Unit = mongoose.model("Unit", unitSchema);
