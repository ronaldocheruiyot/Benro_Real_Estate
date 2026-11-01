import { useMemo, useState } from "react";
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
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Apartment } from "./ApartmentCard";
import { Tenant } from "./TenantsPage";
import { invoicesApi } from "../api/services";
import { toast } from "sonner";

interface GenerateInvoicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apartments: Apartment[];
  tenants: Tenant[];
  onDone: () => void;
}

export function GenerateInvoicesDialog({
  open,
  onOpenChange,
  apartments,
  tenants,
  onDone,
}: GenerateInvoicesDialogProps) {
  const today = new Date().toISOString().split("T")[0];
  const [apartmentId, setApartmentId] = useState<string>("all");
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState("");
  const [periodLabel, setPeriodLabel] = useState(
    new Date().toLocaleString("en-US", { month: "short", year: "numeric" })
  );
  const [includeRent, setIncludeRent] = useState(true);
  const [includeWater, setIncludeWater] = useState(false);
  const [waterRate, setWaterRate] = useState("");
  const [extraDesc, setExtraDesc] = useState("");
  const [extraAmount, setExtraAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [markSent, setMarkSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeTenants = useMemo(
    () =>
      tenants.filter(
        (t) =>
          t.status === "active" &&
          (apartmentId === "all" || t.apartmentId === apartmentId)
      ),
    [tenants, apartmentId]
  );

  const handleGenerate = async () => {
    if (!includeRent && !includeWater && !(extraDesc && extraAmount)) {
      toast.error("Select rent, water, and/or an extra charge");
      return;
    }
    if (!activeTenants.length) {
      toast.error("No active tenants for this selection");
      return;
    }

    setSubmitting(true);
    try {
      const extraCharges =
        extraDesc.trim() && parseFloat(extraAmount) > 0
          ? [
              {
                description: extraDesc.trim(),
                amount: parseFloat(extraAmount),
                unitPrice: parseFloat(extraAmount),
                quantity: 1,
                category: "other",
              },
            ]
          : [];

      const result = await invoicesApi.bulk({
        apartmentId: apartmentId === "all" ? undefined : apartmentId,
        issueDate,
        dueDate: dueDate || undefined,
        periodLabel,
        includeRent,
        includeWater,
        waterRate: parseFloat(waterRate) || 0,
        extraCharges,
        markSent,
        notes,
      });

      toast.success(`Generated ${result.count} invoice(s)`, {
        description: markSent
          ? "Marked as sent — open any invoice to print or email"
          : "Saved as drafts — review then send",
      });
      onDone();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate invoices");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Invoices</DialogTitle>
          <DialogDescription>
            Create invoices for rent, water, or other charges. Customer ID on each
            invoice is the tenant’s unit number.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Property</Label>
            <Select value={apartmentId} onValueChange={setApartmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All properties ({tenants.filter((t) => t.status === "active").length} tenants)</SelectItem>
                {apartments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} (
                    {tenants.filter((t) => t.status === "active" && t.apartmentId === a.id).length}{" "}
                    tenants)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Will create invoices for <strong>{activeTenants.length}</strong> active
              tenant(s).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inv-issue">Issue Date</Label>
              <Input
                id="inv-issue"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-due">Due Date</Label>
              <Input
                id="inv-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inv-period">Billing Period Label</Label>
            <Input
              id="inv-period"
              placeholder="e.g. Nov 2026"
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
            />
          </div>

          <div className="space-y-3 rounded-lg border bg-neutral-50 p-3">
            <p className="text-sm font-medium">Charges to include</p>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={includeRent}
                onCheckedChange={(v) => setIncludeRent(!!v)}
              />
              Monthly rent
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={includeWater}
                onCheckedChange={(v) => setIncludeWater(!!v)}
              />
              Water charge
            </label>
            {includeWater && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="water-rate">Water rate (per unit or flat)</Label>
                <Input
                  id="water-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 50"
                  value={waterRate}
                  onChange={(e) => setWaterRate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Uses each tenant’s recorded water units × rate when available.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="extra-desc">Extra charge (optional)</Label>
                <Input
                  id="extra-desc"
                  placeholder="e.g. Garbage / Parking"
                  value={extraDesc}
                  onChange={(e) => setExtraDesc(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="extra-amt">Amount</Label>
                <Input
                  id="extra-amt"
                  type="number"
                  min="0"
                  step="0.01"
                  value={extraAmount}
                  onChange={(e) => setExtraAmount(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Required unit charges (from unit setup) are added automatically when present.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inv-notes">Notes on invoice</Label>
            <Textarea
              id="inv-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional note shown on every invoice"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={markSent} onCheckedChange={(v) => setMarkSent(!!v)} />
            Mark as sent immediately (ready to email/print)
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-brand-navy text-white hover:bg-brand-navy-deep"
            onClick={handleGenerate}
            disabled={submitting}
          >
            {submitting ? "Generating…" : `Generate ${activeTenants.length} Invoice(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
