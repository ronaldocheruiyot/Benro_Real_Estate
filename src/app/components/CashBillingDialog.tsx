import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tenant, Payment } from "./TenantsPage";
import { Printer } from "lucide-react";
import billingImage from "figma:asset/4ed0fdfafc791f5cdeca850a4d97e3c5a6a63aa9.png";

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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");

  const handlePrintBill = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cash Bill - ${tenant.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              max-width: 800px;
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .section {
              margin: 20px 0;
              padding: 15px;
              background: #f9f9f9;
              border-radius: 8px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
            }
            .label {
              color: #666;
            }
            .value {
              font-weight: bold;
            }
            .total {
              font-size: 24px;
              text-align: right;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #333;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
            }
            .buttons {
              margin-top: 30px;
              text-align: center;
            }
            button {
              padding: 10px 20px;
              margin: 0 10px;
              font-size: 16px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rental Management System</h1>
            <h2>Cash Payment Receipt</h2>
          </div>

          <div class="section">
            <h3>Served By</h3>
            <div class="row">
              <span class="label">Name:</span>
              <span class="value">Admin User</span>
            </div>
            <div class="row">
              <span class="label">Contact:</span>
              <span class="value">admin@company.com</span>
            </div>
          </div>

          <div class="section">
            <h3>Payment Details</h3>
            <div class="row">
              <span class="label">House:</span>
              <span class="value">${tenant.unit}</span>
            </div>
            <div class="row">
              <span class="label">Tenant Name:</span>
              <span class="value">${tenant.name}</span>
            </div>
            <div class="row">
              <span class="label">ID Number:</span>
              <span class="value">${tenant.idNumber}</span>
            </div>
            <div class="row">
              <span class="label">No of Rooms:</span>
              <span class="value">${numberOfRooms}</span>
            </div>
            <div class="row">
              <span class="label">Rent Amount:</span>
              <span class="value">$${parseFloat(amount).toLocaleString()}</span>
            </div>
            <div class="row">
              <span class="label">Water Units:</span>
              <span class="value">${waterUnits}</span>
            </div>
            <div class="row">
              <span class="label">Date:</span>
              <span class="value">${new Date(date).toLocaleDateString()}</span>
            </div>
          </div>

          <div class="total">
            <strong>TOTAL: $${parseFloat(amount).toLocaleString()}</strong>
          </div>

          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>

          <div class="buttons">
            <button onclick="window.print()">PRINT</button>
            <button onclick="window.close()">CLOSE</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const newPayment: Omit<Payment, "id"> = {
      tenantId: tenant.id,
      tenantName: tenant.name,
      unit: tenant.unit,
      amount: parseFloat(amount),
      date,
      method: "cash",
      status: "claimed",
      notes: notes || `Cash payment - ${numberOfRooms} rooms, ${waterUnits} water units`,
    };

    onAddPayment(newPayment);
    
    // Print the bill
    handlePrintBill();
    
    // Reset and close
    setAmount(tenant.rentAmount.toString());
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cash Billing - {tenant.name}</DialogTitle>
          <DialogDescription>
            Create and print a cash payment receipt
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-name">Tenant Name</Label>
                <Input
                  id="tenant-name"
                  value={tenant.name}
                  disabled
                  className="bg-neutral-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id-number">ID Number</Label>
                <Input
                  id="id-number"
                  value={tenant.idNumber}
                  disabled
                  className="bg-neutral-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={tenant.unit}
                  disabled
                  className="bg-neutral-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">Number of Rooms</Label>
                <Input
                  id="rooms"
                  type="number"
                  value={numberOfRooms}
                  onChange={(e) => setNumberOfRooms(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="water">Water Units</Label>
                <Input
                  id="water"
                  type="number"
                  value={waterUnits}
                  onChange={(e) => setWaterUnits(e.target.value)}
                />
              </div>
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

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-900">
                💡 This will record a cash payment and generate a printable receipt.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 gap-2">
              <Printer className="size-4" />
              Record & Print
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
