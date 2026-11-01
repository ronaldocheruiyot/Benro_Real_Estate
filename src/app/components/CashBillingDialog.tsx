import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tenant, Payment } from "./TenantsPage";
import { Printer } from "lucide-react";
import { companySettingsApi, invoicesApi } from "../api/services";
import { openInvoicePrint } from "../utils/invoicePrint";
import { toast } from "sonner";

interface CashBillingDialogProps {
  tenant: Tenant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPayment: (payment: Omit<Payment, "id">) => void;
}

export function CashBillingDialog({ tenant, open, onOpenChange, onAddPayment }: CashBillingDialogProps) {
  const [amount, setAmount] = useState(tenant.rentAmount.toString());
  const [waterUnits, setWaterUnits] = useState(tenant.waterUnits?.toString() || "0");
  const [numberOfRooms, setNumberOfRooms] = useState(tenant.numberOfRooms?.toString() || "1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      const rentAmt = parseFloat(amount) || 0;
      const waterQty = parseFloat(waterUnits) || 0;

      const items = [
        {
          description: `Monthly Rent (${numberOfRooms || 1} room(s))`,
          category: "rent",
          quantity: 1,
          unitPrice: rentAmt,
          amount: rentAmt,
        },
      ];
      if (waterQty > 0) {
        items.push({
          description: `Water (${waterQty} units)`,
          category: "water",
          quantity: waterQty,
          unitPrice: 0,
          amount: 0,
        });
      }

      let invoice;
      try {
        invoice = await invoicesApi.create({
          tenantId: tenant.id,
          items: items.filter((i) => i.amount > 0 || i.category === "rent"),
          issueDate: date,
          periodLabel: new Date(date).toLocaleString("en-US", {
            month: "short",
            year: "numeric",
          }),
          notes:
            notes ||
            `Cash bill — ${numberOfRooms} rooms, ${waterUnits} water units`,
          status: "sent",
          includeRent: false,
          includeWater: false,
        });
      } catch {
        // Fallback printable without API invoice
        invoice = null;
      }

      const newPayment: Omit<Payment, "id"> = {
        tenantId: tenant.id,
        tenantName: tenant.name,
        unit: tenant.unit,
        amount: rentAmt,
        date,
        method: "cash",
        status: "claimed",
        notes:
          notes ||
          `Cash payment - ${numberOfRooms} rooms, ${waterUnits} water units${
            invoice ? ` · Inv ${invoice.invoiceNumber}` : ""
          }`,
      };

      onAddPayment(newPayment);

      const company = await companySettingsApi.get().catch(() => null);
      if (invoice && company) {
        openInvoicePrint(invoice, company);
      } else if (invoice) {
        openInvoicePrint(invoice, {
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
          paymentInstructions: "Thank you for your payment.",
          invoicePrefix: "INV",
          currency: "KES",
          currencySymbol: "KSh",
        });
      }

      toast.success(
        invoice
          ? `Payment recorded · Invoice ${invoice.invoiceNumber}`
          : "Payment recorded"
      );

      setAmount(tenant.rentAmount.toString());
      setNotes("");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to record bill");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cash Billing - {tenant.name}</DialogTitle>
          <DialogDescription>
            Records payment and prints a branded invoice. Customer ID = unit{" "}
            <strong>{tenant.unit}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tenant Name</Label>
                <Input value={tenant.name} disabled className="bg-neutral-100" />
              </div>
              <div className="space-y-2">
                <Label>Customer ID (Unit)</Label>
                <Input value={tenant.unit} disabled className="bg-neutral-100" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rooms">Number of Rooms</Label>
                <Input
                  id="rooms"
                  type="number"
                  value={numberOfRooms}
                  onChange={(e) => setNumberOfRooms(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Rent Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="water">Water Units</Label>
                <Input
                  id="water"
                  type="number"
                  value={waterUnits}
                  onChange={(e) => setWaterUnits(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Payment Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
              Uses your company logo and address from Settings. Invoice numbers are
              generated automatically.
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Printer className="size-4" />
              {submitting ? "Saving…" : "Record & Print Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
