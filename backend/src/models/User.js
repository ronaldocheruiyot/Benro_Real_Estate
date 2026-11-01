import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const permissionsSchema = new mongoose.Schema(
  {
    viewDashboard: { type: Boolean, default: true },
    manageTenants: { type: Boolean, default: false },
    managePayments: { type: Boolean, default: false },
    manageUnits: { type: Boolean, default: false },
    viewReports: { type: Boolean, default: false },
    manageUsers: { type: Boolean, default: false },
    manageAdvertisements: { type: Boolean, default: false },
    viewAllProperties: { type: Boolean, default: false },
    deleteData: { type: Boolean, default: false },
    exportData: { type: Boolean, default: false },
    manageProperties: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "manager", "caretaker", "accountant"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "suspended"],
      default: "active",
    },
    tempPassword: { type: Boolean, default: false },
    permissions: { type: permissionsSchema, default: () => ({}) },
    assignedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Apartment" }],
    lastLogin: { type: String },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  { timestamps: { createdAt: "createdDate", updatedAt: true } }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.model("User", userSchema);

export const defaultPermissionsByRole = {
  admin: {
    viewDashboard: true,
    manageTenants: true,
    managePayments: true,
    manageUnits: true,
    viewReports: true,
    manageUsers: true,
    manageAdvertisements: true,
    viewAllProperties: true,
    deleteData: true,
    exportData: true,
    manageProperties: true,
  },
  manager: {
    viewDashboard: true,
    manageTenants: true,
    managePayments: true,
    manageUnits: true,
    viewReports: true,
    manageUsers: false,
    manageAdvertisements: true,
    viewAllProperties: true,
    deleteData: false,
    exportData: true,
    manageProperties: true,
  },
  caretaker: {
    viewDashboard: true,
    manageTenants: false,
    managePayments: false,
    manageUnits: true,
    viewReports: false,
    manageUsers: false,
    manageAdvertisements: false,
    viewAllProperties: false,
    deleteData: false,
    exportData: false,
    manageProperties: true,
  },
  accountant: {
    viewDashboard: true,
    manageTenants: false,
    managePayments: true,
    manageUnits: false,
    viewReports: true,
    manageUsers: false,
    manageAdvertisements: false,
    viewAllProperties: true,
    deleteData: false,
    exportData: true,
    manageProperties: false,
  },
};
