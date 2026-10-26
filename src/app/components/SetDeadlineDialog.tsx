import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tenant } from "./TenantsPage";

interface SetDeadlineDialogProps {
  tenant: Tenant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetDeadline: (tenantId: string, deadline: string) => void;
}

export function SetDeadlineDialog({ tenant, open, onOpenChange, onSetDeadline }: SetDeadlineDialogProps) {
  const [deadline, setDeadline] = useState(tenant.paymentDeadline || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!deadline) {
      alert("Please select a deadline date");
      return;
    }

    onSetDeadline(tenant.id, deadline);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Payment Deadline</DialogTitle>
          <DialogDescription>
            Set or extend the payment deadline for {tenant.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current Deadline</Label>
              <Input
                id="current"
                value={tenant.paymentDeadline ? new Date(tenant.paymentDeadline).toLocaleDateString() : "Not set"}
                disabled
                className="bg-neutral-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">New Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900">
                💡 Tip: The tenant will receive an email notification about the new deadline.
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
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Set Deadline
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
