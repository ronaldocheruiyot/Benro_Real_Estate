import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AddVacantUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (unitName: string) => void;
}

export function AddVacantUnitDialog({ open, onOpenChange, onAdd }: AddVacantUnitDialogProps) {
  const [unitName, setUnitName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!unitName.trim()) {
      alert("Please enter a unit name");
      return;
    }

    onAdd(unitName.trim());
    setUnitName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Vacant Unit</DialogTitle>
          <DialogDescription>
            Add a new vacant unit to track availability
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unit-name">Unit Name *</Label>
              <Input
                id="unit-name"
                placeholder="e.g., Unit 8A"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                required
              />
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
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              Add Unit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
