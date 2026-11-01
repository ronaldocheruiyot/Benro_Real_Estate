import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./config/db.js";
import { uploadRoot } from "./middleware/upload.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import apartmentRoutes from "./routes/apartments.js";
import unitRoutes from "./routes/units.js";
import tenantRoutes from "./routes/tenants.js";
import paymentRoutes from "./routes/payments.js";
import activityRoutes from "./routes/activities.js";
import advertisementRoutes from "./routes/advertisements.js";
import documentRoutes from "./routes/documents.js";
import maintenanceRoutes from "./routes/maintenance.js";
import inspectionRoutes from "./routes/inspections.js";
import budgetRoutes from "./routes/budgets.js";
import landRoutes from "./routes/lands.js";
import uploadRoutes from "./routes/uploads.js";
import notificationRoutes from "./routes/notifications.js";
import dashboardRoutes from "./routes/dashboard.js";
import settingsRoutes from "./routes/settings.js";
import invoiceRoutes from "./routes/invoices.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 5000);

const origins = (process.env.CLIENT_ORIGIN || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || origins.includes("*") || origins.includes(origin)) {
        cb(null, true);
      } else {
        cb(null, true); // allow Electron/file and local tools during development
      }
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use("/uploads", express.static(uploadRoot));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "benro-backend",
    side: "backend",
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/advertisements", advertisementRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/lands", landRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/invoices", invoiceRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

await connectDb(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/benro_real_estate");

app.listen(port, () => {
  console.log(`[BACKEND] BENRO API listening on http://localhost:${port}`);
  console.log(`[BACKEND] This process is API-only (not the React frontend).`);
  console.log(`[BACKEND] Uploads directory: ${uploadRoot}`);
});
