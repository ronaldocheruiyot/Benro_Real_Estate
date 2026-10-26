import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    apartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Apartment", required: true, index: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", default: null },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    unit: { type: String, required: true },
    rentAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "partial"],
      default: "unpaid",
    },
    avatar: { type: String, default: "" },
    joiningDate: { type: String, required: true },
    paymentDeadline: { type: String },
    status: {
      type: String,
      enum: ["active", "left", "vacant"],
      default: "active",
    },
    idNumber: { type: String, default: "" },
    birthDate: { type: String, default: "" },
    numberOfRooms: { type: Number },
    waterUnits: { type: Number },
    leftReason: { type: String },
    leftDate: { type: String },
    hasAccount: { type: Boolean, default: false },
    username: { type: String },
    passwordHash: { type: String },
    accountStatus: {
      type: String,
      enum: ["none", "pending", "active", "suspended"],
      default: "none",
    },
  },
  { timestamps: true }
);

export const Tenant = mongoose.model("Tenant", tenantSchema);
