import { Router } from "express";
import { Apartment } from "../models/Apartment.js";
import { Tenant } from "../models/Tenant.js";
import { Unit } from "../models/Unit.js";
import { Payment } from "../models/Payment.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/summary", async (_req, res) => {
  const [apartments, tenants, units, payments] = await Promise.all([
    Apartment.countDocuments(),
    Tenant.countDocuments({ status: "active" }),
    Unit.find(),
    Payment.find(),
  ]);

  const occupied = units.filter((u) => u.status === "occupied").length;
  const vacant = units.filter((u) => u.status === "vacant").length;
  const revenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  res.json({
    apartments,
    activeTenants: tenants,
    units: units.length,
    occupied,
    vacant,
    totalRevenue: revenue,
  });
});

export default router;
