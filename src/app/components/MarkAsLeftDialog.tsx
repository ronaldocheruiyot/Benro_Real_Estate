import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Tenant } from "./TenantsPage";
import { AlertCircle } from "lucide-react";

interface MarkAsLeftDialogProps {
  tenant: Tenant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsLeft: (tenantId: string, reason: string) => void;
}

export function MarkAsLeftDialog({ tenant, open, onOpenChange, onMarkAsLeft }: MarkAsLeftDialogProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      alert("Please provide a reason for marking this tenant as left");
      return;
    }

    if (confirm(`Are you sure you want to mark ${tenant.name} as left? This action will change their status.`)) {
      onMarkAsLeft(tenant.id, reason);
      setReason("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Tenant as Left</DialogTitle>
          <DialogDescription>
            Record why {tenant.name} is leaving
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="size-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-900">Warning</p>
                <p className="text-yellow-700 text-sm mt-1">
                  This will change {tenant.name}'s status to "Left" and they will be moved to the inactive tenants list.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Leaving *</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Relocated to another city, Found a different apartment, Contract ended, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={4}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900">
                <strong>Tenant:</strong> {tenant.name}
              </p>
              <p className="text-blue-900">
                <strong>Unit:</strong> {tenant.unit}
              </p>
              <p className="text-blue-900">
                <strong>Leave Date:</strong> {new Date().toLocaleDateString()}
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
            <Button type="submit" variant="destructive">
              Mark as Left
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
