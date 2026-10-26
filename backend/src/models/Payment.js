import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema(
  {
    chargeId: String,
    chargeName: String,
    allocatedAmount: Number,
    isBaseRent: Boolean,
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    apartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Apartment", index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    tenantName: { type: String, required: true },
    unit: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true },
    method: {
      type: String,
      enum: ["bank_transfer", "cash", "check", "online"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["claimed", "unclaimed", "pending"],
      default: "claimed",
    },
    transactionId: { type: String },
    notes: { type: String },
    allocations: { type: [allocationSchema], default: [] },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
