import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Download, Eye, FileText, Mail, Plus, Trash2 } from "lucide-react";
import { Tenant } from "./TenantsPage";
import { Unit } from "./UnitsPage";
import {
  companySettingsApi,
  invoicesApi,
  type CompanySettings,
  type InvoiceItem,
  type InvoiceRecord,
} from "../api/services";
import { assetUrl } from "../api/client";
import {
  downloadFilledTemplatePdf,
  emailInvoice,
  openInvoicePrint,
} from "../utils/invoicePrint";
import { toast } from "sonner";

type EditableLine = {
  key: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  enabled: boolean;
  locked?: boolean;
};

interface TenantInvoiceDialogProps {
  tenant: Tenant;
  unit?: Unit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

function money(amount: number, symbol: string) {
  return `${symbol} ${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function TenantInvoiceDialog({
  tenant,
  unit,
  open,
  onOpenChange,
  onCreated,
}: TenantInvoiceDialogProps) {
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [periodLabel, setPeriodLabel] = useState(
    new Date().toLocaleString("en-US", { month: "short", year: "numeric" })
  );
  const [lines, setLines] = useState<EditableLine[]>([]);
  const [extraDesc, setExtraDesc] = useState("");
  const [extraAmount, setExtraAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    companySettingsApi
      .get()
      .then(setCompany)
      .catch(() => setCompany(null));

    const rent = Number(unit?.baseRent ?? tenant.rentAmount) || 0;
    const next: EditableLine[] = [
      {
        key: "rent",
        description: "Monthly Rent",
        category: "rent",
        quantity: 1,
        unitPrice: rent,
        amount: rent,
        enabled: true,
      },
    ];

    for (const charge of unit?.charges || []) {
      const amt = Number(charge.amount) || 0;
      next.push({
        key: `charge-${charge.id}`,
        description: charge.name || "Charge",
        category: "other",
        quantity: 1,
        unitPrice: amt,
        amount: amt,
        enabled: !charge.isOptional,
      });
    }

    const waterUnits = Number(tenant.waterUnits) || 0;
    next.push({
      key: "water",
      description: waterUnits > 0 ? `Water (${waterUnits} units)` : "Water",
      category: "water",
      quantity: waterUnits > 0 ? waterUnits : 1,
      unitPrice: 0,
      amount: 0,
      enabled: waterUnits > 0,
    });

    setLines(next);
    setIssueDate(new Date().toISOString().slice(0, 10));
    setPeriodLabel(new Date().toLocaleString("en-US", { month: "short", year: "numeric" }));
    setExtraDesc("");
    setExtraAmount("");
  }, [open, tenant, unit]);

  const enabledItems: InvoiceItem[] = useMemo(
    () =>
      lines
        .filter((l) => l.enabled && Number(l.amount) > 0)
        .map((l) => ({
          description: l.description,
          category: l.category,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          amount: l.amount,
        })),
    [lines]
  );

  const total = enabledItems.reduce((s, i) => s + Number(i.amount || 0), 0);
  const symbol = company?.currencySymbol || "KSh";
  const logo = company?.logoUrl ? assetUrl(company.logoUrl) : "";
  const address = [
    company?.addressLine1,
    company?.addressLine2,
    [company?.city, company?.country].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(" · ");

  const previewInvoiceNo = `${(company?.invoicePrefix || "INV").toUpperCase()}-PREVIEW`;

  const buildDraftInvoice = (invoiceNumber = previewInvoiceNo): InvoiceRecord => ({
    id: "preview",
    invoiceNumber,
    customerId: tenant.unit,
    apartmentId: tenant.apartmentId,
    tenantId: tenant.id,
    tenantName: tenant.name,
    tenantEmail: tenant.email,
    tenantPhone: tenant.phone,
    unit: tenant.unit,
    periodLabel,
    issueDate,
    dueDate,
    items: enabledItems,
    subtotal: total,
    total,
    currency: company?.currency || "KES",
    status: "draft",
  });

  const updateLine = (key: string, patch: Partial<EditableLine>) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const next = { ...l, ...patch };
        if (patch.quantity !== undefined || patch.unitPrice !== undefined) {
          next.amount = Number(next.quantity || 0) * Number(next.unitPrice || 0);
        }
        if (patch.amount !== undefined && patch.unitPrice === undefined && patch.quantity === undefined) {
          next.unitPrice = next.quantity ? next.amount / next.quantity : next.amount;
        }
        return next;
      })
    );
  };

  const addExtra = () => {
    const amt = parseFloat(extraAmount);
    if (!extraDesc.trim() || !(amt > 0)) {
      toast.error("Enter a description and amount for the extra charge");
      return;
    }
    setLines((prev) => [
      ...prev,
      {
        key: `extra-${Date.now()}`,
        description: extraDesc.trim(),
        category: "other",
        quantity: 1,
        unitPrice: amt,
        amount: amt,
        enabled: true,
      },
    ]);
    setExtraDesc("");
    setExtraAmount("");
  };

  const handleFullPreview = () => {
    if (!enabledItems.length) {
      toast.error("Enable at least one charge");
      return;
    }
    openInvoicePrint(
      buildDraftInvoice(),
      company || {
        companyName: "Property Management",
        logoUrl: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        country: "",
        phone: "",
        email: "",
        website: "",
        taxId: "",
        bankName: "",
        bankAccountName: "",
        bankAccountNumber: "",
        bankBranch: "",
        paymentInstructions: "",
        invoicePrefix: "INV",
        currency: "KES",
        currencySymbol: "KSh",
      }
    );
  };

  const saveInvoice = async (status: "draft" | "sent" = "draft") => {
    return invoicesApi.create({
      tenantId: tenant.id,
      items: enabledItems,
      issueDate,
      dueDate: dueDate || undefined,
      periodLabel,
      status,
      includeRent: false,
      includeWater: false,
    });
  };

  const handleCreate = async (alsoEmail = false) => {
    if (!enabledItems.length) {
      toast.error("Enable at least one charge");
      return;
    }
    setSaving(true);
    try {
      const created = await saveInvoice(alsoEmail ? "sent" : "draft");
      toast.success(`Invoice ${created.invoiceNumber} created`);
      if (alsoEmail && company) {
        if (!tenant.email) toast.error("Tenant has no email — invoice saved only");
        else emailInvoice(created, company);
      } else if (company) {
        openInvoicePrint(created, company);
      }
      onCreated?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!enabledItems.length) {
      toast.error("Enable at least one charge");
      return;
    }
    setSaving(true);
    try {
      const created = await saveInvoice("draft");
      try {
        await downloadFilledTemplatePdf(created);
        toast.success(`Downloaded ${created.invoiceNumber}.pdf`);
      } catch {
        // No draft template uploaded — open printable page so owner can Save as PDF
        if (company) openInvoicePrint(created, company);
        toast.message("Opened printable invoice — use Print → Save as PDF for a physical copy");
      }
      onCreated?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to download invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice — {tenant.name}</DialogTitle>
          <DialogDescription>
            Set charges for this tenant and preview the invoice. Customer ID ={" "}
            <strong>{tenant.unit}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Charges editor */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inv-issue">Issue date</Label>
                <Input
                  id="inv-issue"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-due">Due date</Label>
                <Input
                  id="inv-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="inv-period">Period label</Label>
                <Input
                  id="inv-period"
                  value={periodLabel}
                  onChange={(e) => setPeriodLabel(e.target.value)}
                  placeholder="e.g. Nov 2026"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Charges for this tenant</Label>
              <ul className="space-y-2">
                {lines.map((line) => (
                  <li
                    key={line.key}
                    className="rounded-lg border bg-white p-3"
                  >
                    <div className="mb-2 flex items-start gap-2">
                      <Checkbox
                        checked={line.enabled}
                        onCheckedChange={(v) => updateLine(line.key, { enabled: !!v })}
                        className="mt-1"
                      />
                      <Input
                        value={line.description}
                        disabled={!line.enabled}
                        onChange={(e) => updateLine(line.key, { description: e.target.value })}
                        className="h-8"
                      />
                      {!line.key.startsWith("rent") && !line.key.startsWith("charge-") && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8 shrink-0 text-red-600"
                          onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 pl-7">
                      <div className="space-y-1">
                        <Label className="text-xs">Qty</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          disabled={!line.enabled}
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(line.key, { quantity: parseFloat(e.target.value) || 0 })
                          }
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Rate</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={!line.enabled}
                          value={line.unitPrice}
                          onChange={(e) =>
                            updateLine(line.key, { unitPrice: parseFloat(e.target.value) || 0 })
                          }
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Amount</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={!line.enabled}
                          value={line.amount}
                          onChange={(e) =>
                            updateLine(line.key, { amount: parseFloat(e.target.value) || 0 })
                          }
                          className="h-8"
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px_auto]">
              <Input
                placeholder="Extra charge (e.g. Garbage)"
                value={extraDesc}
                onChange={(e) => setExtraDesc(e.target.value)}
              />
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                value={extraAmount}
                onChange={(e) => setExtraAmount(e.target.value)}
              />
              <Button type="button" variant="outline" className="gap-1" onClick={addExtra}>
                <Plus className="size-4" />
                Add
              </Button>
            </div>

            <div className="rounded-lg bg-brand-cyan-soft/50 px-3 py-2 text-sm">
              Total due: <strong>{money(total, symbol)}</strong>
            </div>
          </div>

          {/* Live preview */}
          <div className="overflow-hidden rounded-lg border bg-neutral-100">
            <div className="flex items-center justify-between border-b bg-white px-3 py-2">
              <p className="text-sm font-medium text-brand-navy">Live invoice preview</p>
              <p className="text-xs text-muted-foreground">Updates as you set charges</p>
            </div>
            <div className="flex justify-center p-3">
              <div
                className="w-full max-w-[380px] bg-white text-[10px] text-[#1a2430] shadow-md sm:text-[11px]"
                style={{ aspectRatio: "618 / 800" }}
              >
                <div className="flex h-full flex-col p-3 sm:p-4">
                  <div className="mb-2 flex items-start justify-between gap-2 border-b-2 border-[#0b2a4a] pb-2">
                    <div className="flex min-w-0 items-start gap-2">
                      {logo ? (
                        <img src={logo} alt="" className="size-10 shrink-0 rounded border object-contain" />
                      ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded border bg-neutral-50 text-[8px] text-muted-foreground">
                          Logo
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#0b2a4a]">
                          {company?.companyName || "Company Name"}
                        </p>
                        <p className="line-clamp-2 text-[9px] text-neutral-500">
                          {address || "Address from Settings"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="inline-block rounded bg-[#0b2a4a] px-2 py-0.5 text-[9px] font-bold tracking-wider text-white">
                        INVOICE
                      </span>
                      <p className="mt-1 font-semibold">{previewInvoiceNo}</p>
                      <p className="text-neutral-500">Date: {issueDate}</p>
                      {periodLabel && <p className="text-neutral-500">Period: {periodLabel}</p>}
                    </div>
                  </div>

                  <div className="mb-2 grid grid-cols-2 gap-2">
                    <div className="rounded border bg-[#f4f7fb] p-2">
                      <p className="mb-0.5 text-[8px] font-semibold uppercase text-neutral-500">Bill To</p>
                      <p className="font-semibold">{tenant.name}</p>
                      <p className="truncate text-neutral-500">{tenant.email}</p>
                    </div>
                    <div className="rounded border bg-[#f4f7fb] p-2">
                      <p className="mb-0.5 text-[8px] font-semibold uppercase text-neutral-500">Account</p>
                      <p>
                        <span className="text-neutral-500">Customer ID: </span>
                        <span className="font-semibold">{tenant.unit}</span>
                      </p>
                    </div>
                  </div>

                  <table className="mb-2 w-full border-collapse">
                    <thead>
                      <tr className="bg-[#0b2a4a] text-left text-white">
                        <th className="px-1 py-1">Description</th>
                        <th className="px-1 py-1 text-right">Amt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enabledItems.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-1 py-2 text-neutral-400">
                            No charges selected
                          </td>
                        </tr>
                      ) : (
                        enabledItems.map((item) => (
                          <tr key={item.description + item.amount} className="border-b">
                            <td className="px-1 py-1">{item.description}</td>
                            <td className="px-1 py-1 text-right">{money(item.amount, symbol)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <div className="ml-auto mb-2 w-[60%] overflow-hidden rounded border">
                    <div className="flex justify-between bg-[#0b2a4a] px-2 py-1.5 font-bold text-white">
                      <span>Total Due</span>
                      <span>{money(total, symbol)}</span>
                    </div>
                  </div>

                  <div className="mt-auto border-t border-dashed pt-2 text-[9px] text-neutral-500">
                    <p className="font-semibold text-[#0b2a4a]">Payment details</p>
                    {company?.bankName ? (
                      <p>
                        Bank: {company.bankName}
                        {company.bankBranch ? ` — ${company.bankBranch}` : ""}
                      </p>
                    ) : (
                      <p className="italic">Set bank details in Settings</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button type="button" variant="outline" className="gap-2" onClick={handleFullPreview}>
            <Eye className="size-4" />
            Full-page preview
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={saving}
            onClick={() => handleCreate(true)}
          >
            <Mail className="size-4" />
            Create & email
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={saving}
            onClick={() => handleCreate(false)}
          >
            <FileText className="size-4" />
            Create invoice
          </Button>
          <Button
            type="button"
            className="gap-2 bg-brand-navy text-white hover:bg-brand-navy-deep"
            disabled={saving}
            onClick={handleDownload}
          >
            <Download className="size-4" />
            {saving ? "Preparing…" : "Download PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
