import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tenant, Payment } from "./TenantsPage";
import { Unit } from "./UnitsPage";
import { Printer, DollarSign } from "lucide-react";
import { Badge } from "./ui/badge";

interface ChargeAllocation {
  chargeId: string;
  chargeName: string;
  allocatedAmount: number;
  isBaseRent?: boolean;
}

interface CashBillingWithChargesDialogProps {
  tenant: Tenant;
  unit: Unit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPayment: (payment: Omit<Payment, "id"> & { allocations: ChargeAllocation[] }) => void;
}

export function CashBillingWithChargesDialog({ 
  tenant, 
  unit,
  open, 
  onOpenChange, 
  onAddPayment 
}: CashBillingWithChargesDialogProps) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [allocations, setAllocations] = useState<ChargeAllocation[]>([]);

  useEffect(() => {
    if (unit && open) {
      // Initialize allocations with base rent and charges
      const initialAllocations: ChargeAllocation[] = [
        {
          chargeId: "base-rent",
          chargeName: "Base Rent",
          allocatedAmount: 0,
          isBaseRent: true
        },
        ...unit.charges.map(charge => ({
          chargeId: charge.id,
          chargeName: charge.name,
          allocatedAmount: 0
        }))
      ];
      setAllocations(initialAllocations);
      setAmount(tenant.rentAmount.toString());
    }
  }, [unit, tenant, open]);

  useEffect(() => {
    // Auto-distribute amount across allocations
    const totalAmount = parseFloat(amount) || 0;
    if (totalAmount > 0 && allocations.length > 0) {
      distributeAmount(totalAmount);
    }
  }, [amount]);

  const distributeAmount = (totalAmount: number) => {
    if (!unit) return;

    let remaining = totalAmount;
    const newAllocations = [...allocations];

    // First, allocate to base rent
    const baseRentIndex = newAllocations.findIndex(a => a.isBaseRent);
    if (baseRentIndex !== -1 && remaining > 0) {
      const baseRentAmount = Math.min(remaining, unit.baseRent);
      newAllocations[baseRentIndex].allocatedAmount = baseRentAmount;
      remaining -= baseRentAmount;
    }

    // Then allocate to required charges
    const requiredCharges = unit.charges.filter(c => !c.isOptional);
    for (const charge of requiredCharges) {
      const allocationIndex = newAllocations.findIndex(a => a.chargeId === charge.id);
      if (allocationIndex !== -1 && remaining > 0) {
        const chargeAmount = Math.min(remaining, charge.amount);
        newAllocations[allocationIndex].allocatedAmount = chargeAmount;
        remaining -= chargeAmount;
      }
    }

    // Finally, allocate to optional charges if there's remaining amount
    const optionalCharges = unit.charges.filter(c => c.isOptional);
    for (const charge of optionalCharges) {
      const allocationIndex = newAllocations.findIndex(a => a.chargeId === charge.id);
      if (allocationIndex !== -1 && remaining > 0) {
        const chargeAmount = Math.min(remaining, charge.amount);
        newAllocations[allocationIndex].allocatedAmount = chargeAmount;
        remaining -= chargeAmount;
      }
    }

    setAllocations(newAllocations);
  };

  const handleAllocationChange = (chargeId: string, value: string) => {
    const newValue = parseFloat(value) || 0;
    setAllocations(allocations.map(a => 
      a.chargeId === chargeId 
        ? { ...a, allocatedAmount: newValue }
        : a
    ));
  };

  const getTotalAllocated = () => {
    return allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
  };

  const getUnallocatedAmount = () => {
    const total = parseFloat(amount) || 0;
    return total - getTotalAllocated();
  };

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
              padding: 5px 0;
            }
            .label {
              color: #666;
            }
            .value {
              font-weight: bold;
            }
            .allocations {
              margin: 20px 0;
            }
            .allocation-row {
              display: flex;
              justify-content: space-between;
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            .allocation-row:last-child {
              border-bottom: none;
            }
            .total {
              font-size: 20px;
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
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rental Management System</h1>
            <h2>Cash Payment Receipt</h2>
          </div>

          <div class="section">
            <h3>Tenant Information</h3>
            <div class="row">
              <span class="label">Name:</span>
              <span class="value">${tenant.name}</span>
            </div>
            <div class="row">
              <span class="label">ID Number:</span>
              <span class="value">${tenant.idNumber}</span>
            </div>
            <div class="row">
              <span class="label">Unit:</span>
              <span class="value">${tenant.unit}</span>
            </div>
            <div class="row">
              <span class="label">Email:</span>
              <span class="value">${tenant.email}</span>
            </div>
          </div>

          <div class="section">
            <h3>Payment Details</h3>
            <div class="row">
              <span class="label">Date:</span>
              <span class="value">${new Date(date).toLocaleDateString()}</span>
            </div>
            <div class="row">
              <span class="label">Payment Method:</span>
              <span class="value">Cash</span>
            </div>
          </div>

          <div class="section">
            <h3>Payment Allocation</h3>
            <div class="allocations">
              ${allocations
                .filter(a => a.allocatedAmount > 0)
                .map(a => `
                  <div class="allocation-row">
                    <span>${a.chargeName}</span>
                    <span class="value">$${a.allocatedAmount.toLocaleString()}</span>
                  </div>
                `).join('')}
            </div>
          </div>

          ${notes ? `
            <div class="section">
              <h3>Notes</h3>
              <p>${notes}</p>
            </div>
          ` : ''}

          <div class="total">
            <div class="row">
              <span>Total Amount Paid:</span>
              <span class="value">$${parseFloat(amount).toLocaleString()}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; margin-right: 10px; cursor: pointer;">Print</button>
            <button onclick="window.close()" style="padding: 10px 20px; cursor: pointer;">Close</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    const payment = {
      tenantId: tenant.id,
      tenantName: tenant.name,
      unit: tenant.unit,
      amount: parseFloat(amount),
      date,
      method: "cash" as const,
      status: "claimed" as const,
      notes: notes || undefined,
      allocations: allocations.filter(a => a.allocatedAmount > 0)
    };

    onAddPayment(payment);
    onOpenChange(false);
    
    // Reset form
    setAmount("");
    setDate(new Date().toISOString().split('T')[0]);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cash Billing - {tenant.name}</DialogTitle>
          <DialogDescription>
            Record a cash payment and allocate to charges
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Total Payment Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="date">Payment Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Charge Allocations */}
          {unit && allocations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-neutral-900">Payment Allocation</h3>
                <Badge variant={getUnallocatedAmount() === 0 ? "default" : "destructive"}>
                  {getUnallocatedAmount() === 0 
                    ? "Fully Allocated" 
                    : `$${getUnallocatedAmount().toFixed(2)} Unallocated`}
                </Badge>
              </div>

              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                {allocations.map((allocation, index) => {
                  const charge = allocation.isBaseRent 
                    ? { amount: unit.baseRent, isOptional: false }
                    : unit.charges.find(c => c.id === allocation.chargeId);
                  
                  return (
                    <div 
                      key={allocation.chargeId}
                      className={`p-4 ${index !== 0 ? 'border-t border-neutral-200' : ''} ${
                        allocation.isBaseRent ? 'bg-blue-50' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-900">{allocation.chargeName}</span>
                          {charge && (
                            <>
                              <Badge variant="outline" className="text-xs">
                                Max: ${charge.amount.toLocaleString()}
                              </Badge>
                              {!charge.isOptional && (
                                <Badge variant="default" className="text-xs">Required</Badge>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          type="number"
                          step="0.01"
                          value={allocation.allocatedAmount || ""}
                          onChange={(e) => handleAllocationChange(allocation.chargeId, e.target.value)}
                          max={charge?.amount}
                          className="pl-10"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-neutral-100 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neutral-700">Total Allocated:</span>
                  <span className="text-neutral-900">${getTotalAllocated().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-700">Payment Amount:</span>
                  <span className="text-neutral-900">${(parseFloat(amount) || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handlePrintBill}>
            <Printer className="mr-2 h-4 w-4" />
            Print Bill
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
