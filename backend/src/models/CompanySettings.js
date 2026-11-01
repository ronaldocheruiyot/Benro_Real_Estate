import mongoose from "mongoose";

const companySettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    companyName: { type: String, default: "BENRO Real Estate" },
    logoUrl: { type: String, default: "" },
    addressLine1: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    taxId: { type: String, default: "" },
    bankName: { type: String, default: "" },
    bankAccountName: { type: String, default: "" },
    bankAccountNumber: { type: String, default: "" },
    bankBranch: { type: String, default: "" },
    paymentInstructions: {
      type: String,
      default: "Please pay using the invoice number as the payment reference.",
    },
    invoicePrefix: { type: String, default: "INV" },
    currency: { type: String, default: "KES" },
    currencySymbol: { type: String, default: "KSh" },
    nextInvoiceSeq: { type: Number, default: 1 },
    /** Uploaded draft invoice PDF — system stamps tenant/invoice fields onto a copy */
    invoiceTemplateUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const CompanySettings = mongoose.model("CompanySettings", companySettingsSchema);

export async function getOrCreateCompanySettings() {
  let doc = await CompanySettings.findOne({ key: "default" });
  if (!doc) {
    doc = await CompanySettings.create({ key: "default" });
  }
  return doc;
}
