import { Router } from "express";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { getOrCreateCompanySettings } from "../models/CompanySettings.js";
import { serialize } from "../utils/serialize.js";

const router = Router();
router.use(requireAuth);

router.get("/company", async (_req, res) => {
  try {
    const doc = await getOrCreateCompanySettings();
    res.json(serialize(doc));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/company", requireRoles("admin", "manager"), async (req, res) => {
  try {
    const doc = await getOrCreateCompanySettings();
    const allowed = [
      "companyName",
      "logoUrl",
      "addressLine1",
      "addressLine2",
      "city",
      "country",
      "phone",
      "email",
      "website",
      "taxId",
      "bankName",
      "bankAccountName",
      "bankAccountNumber",
      "bankBranch",
      "paymentInstructions",
      "invoicePrefix",
      "currency",
      "currencySymbol",
      "invoiceTemplateUrl",
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) doc[key] = req.body[key];
    }
    await doc.save();
    res.json(serialize(doc));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
