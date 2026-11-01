import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["rent", "water", "deposit", "penalty", "utility", "other"],
      default: "other",
    },
    quantity: { type: Number, default: 1, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    /** Customer ID shown on invoice = rented unit number */
    customerId: { type: String, required: true },
    apartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Apartment", index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    tenantName: { type: String, required: true },
    tenantEmail: { type: String, default: "" },
    tenantPhone: { type: String, default: "" },
    unit: { type: String, required: true },
    periodLabel: { type: String, default: "" },
    issueDate: { type: String, required: true },
    dueDate: { type: String, default: "" },
    items: { type: [invoiceItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: "KES" },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue", "cancelled"],
      default: "draft",
    },
    notes: { type: String, default: "" },
    sentAt: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model("Invoice", invoiceSchema);
