import "dotenv/config";
import { connectDb } from "./config/db.js";
import { User, defaultPermissionsByRole } from "./models/User.js";
import { Apartment } from "./models/Apartment.js";
import { Unit } from "./models/Unit.js";
import { Tenant } from "./models/Tenant.js";
import { Payment } from "./models/Payment.js";
import { Advertisement } from "./models/Advertisement.js";
import { Land } from "./models/Land.js";
import { Notification } from "./models/Notification.js";
import { Budget } from "./models/Budget.js";

async function seed() {
  await connectDb(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/benro_real_estate");

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Apartment.deleteMany({}),
    Unit.deleteMany({}),
    Tenant.deleteMany({}),
    Payment.deleteMany({}),
    Advertisement.deleteMany({}),
    Land.deleteMany({}),
    Notification.deleteMany({}),
    Budget.deleteMany({}),
  ]);

  console.log("Creating users...");
  const users = await User.create([
    {
      name: "Admin User",
      email: "admin@company.com",
      password: "admin123",
      role: "admin",
      permissions: defaultPermissionsByRole.admin,
    },
    {
      name: "John Manager",
      email: "manager@company.com",
      password: "manager123",
      role: "manager",
      permissions: defaultPermissionsByRole.manager,
    },
    {
      name: "Mike Caretaker",
      email: "caretaker@company.com",
      password: "caretaker123",
      role: "caretaker",
      permissions: defaultPermissionsByRole.caretaker,
    },
    {
      name: "Sarah Accountant",
      email: "accountant@company.com",
      password: "accountant123",
      role: "accountant",
      permissions: defaultPermissionsByRole.accountant,
    },
  ]);

  const admin = users[0];

  console.log("Creating apartments...");
  const apartments = await Apartment.create([
    {
      name: "Sunset Apartments",
      description:
        "Spacious 3-bedroom apartments with parking. Modern amenities and beautiful city views.",
      imageUrl:
        "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1080&q=80",
      address: "12 Sunset Blvd",
      hasUnitsConfigured: true,
      createdBy: admin._id,
    },
    {
      name: "Harbor View Residences",
      description: "Luxury waterfront apartments with premium finishes and stunning harbor views.",
      imageUrl:
        "https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?auto=format&fit=crop&w=1080&q=80",
      address: "88 Harbor Way",
      hasUnitsConfigured: false,
      createdBy: admin._id,
    },
    {
      name: "Downtown Lofts",
      description: "Urban living at its finest. Contemporary design with easy access to the city center.",
      imageUrl:
        "https://images.unsplash.com/photo-1565363887715-8884629e09ee?auto=format&fit=crop&w=1080&q=80",
      address: "5 Main Street",
      hasUnitsConfigured: false,
      createdBy: admin._id,
    },
  ]);

  const sunset = apartments[0];

  console.log("Creating units...");
  const units = await Unit.create([
    {
      apartmentId: sunset._id,
      unitNumber: "Unit 101",
      unitType: "2-bedroom",
      baseRent: 2000,
      charges: [
        { id: "c1", name: "Water", amount: 50, isOptional: false, type: "variable" },
        { id: "c2", name: "Electricity", amount: 80, isOptional: false, type: "variable" },
        { id: "c3", name: "Garbage", amount: 20, isOptional: false, type: "fixed" },
      ],
      status: "occupied",
      floor: 1,
      squareFeet: 850,
    },
    {
      apartmentId: sunset._id,
      unitNumber: "Unit 102",
      unitType: "3-bedroom",
      baseRent: 2500,
      charges: [
        { id: "c4", name: "Water", amount: 60, isOptional: false, type: "variable" },
        { id: "c5", name: "Electricity", amount: 100, isOptional: false, type: "variable" },
        { id: "c6", name: "Parking", amount: 50, isOptional: true, type: "fixed" },
      ],
      status: "vacant",
      floor: 1,
      squareFeet: 1200,
    },
    {
      apartmentId: sunset._id,
      unitNumber: "Unit 4B",
      unitType: "2-bedroom",
      baseRent: 2500,
      charges: [],
      status: "occupied",
      floor: 4,
      squareFeet: 900,
    },
  ]);

  console.log("Creating tenants...");
  const tenants = await Tenant.create([
    {
      apartmentId: sunset._id,
      unitId: units[2]._id,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      unit: "Unit 4B",
      rentAmount: 2500,
      paymentStatus: "paid",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
      joiningDate: "2023-01-01",
      paymentDeadline: "2026-11-05",
      status: "active",
      idNumber: "0712345678",
      birthDate: "1990-05-15",
      numberOfRooms: 2,
      waterUnits: 45,
    },
    {
      apartmentId: sunset._id,
      unitId: units[0]._id,
      name: "Mary Jane",
      email: "mary@example.com",
      phone: "+1 (555) 234-5678",
      unit: "Unit 101",
      rentAmount: 2150,
      paymentStatus: "unpaid",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      joiningDate: "2023-03-01",
      paymentDeadline: "2026-11-01",
      status: "active",
      idNumber: "0798765432",
      birthDate: "1988-09-20",
      numberOfRooms: 2,
    },
  ]);

  units[0].tenantId = tenants[1]._id;
  units[2].tenantId = tenants[0]._id;
  await units[0].save();
  await units[2].save();

  await Payment.create({
    apartmentId: sunset._id,
    tenantId: tenants[0]._id,
    tenantName: tenants[0].name,
    unit: tenants[0].unit,
    amount: 2500,
    date: "2026-10-01",
    method: "bank_transfer",
    status: "claimed",
    transactionId: "TXN-SEED-001",
    recordedBy: admin._id,
  });

  await Advertisement.create({
    title: "Sunny 2-Bedroom at Sunset",
    description: "Bright unit with balcony and parking.",
    propertyId: sunset._id,
    propertyName: sunset.name,
    unitType: "2-bedroom",
    rentAmount: 2150,
    images: [sunset.imageUrl],
    status: "published",
    published: true,
    contactEmail: "admin@company.com",
    contactPhone: "+1 555 000 1111",
    createdBy: admin._id,
  });

  await Land.create({
    name: "Greenfield Plot A",
    location: "North County",
    size: "0.5 acres",
    status: "available",
    value: 120000,
    notes: "Ready for development",
  });

  await Budget.create({
    title: "Q4 Maintenance Fund",
    category: "maintenance",
    apartmentId: sunset._id,
    amount: 15000,
    spent: 3200,
    period: "2026-Q4",
    status: "approved",
    createdBy: admin._id,
    approvedBy: users[1]._id,
  });

  for (const user of users) {
    await Notification.create({
      userId: user._id,
      title: "Welcome to BENRO",
      message: "Your local MongoDB workspace is ready. Explore tenants, units, and payments.",
      type: "success",
    });
  }

  console.log("\nSeed complete.\nLogin accounts:");
  console.log("  admin@company.com / admin123");
  console.log("  manager@company.com / manager123");
  console.log("  caretaker@company.com / caretaker123");
  console.log("  accountant@company.com / accountant123");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
