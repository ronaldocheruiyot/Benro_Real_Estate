import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { Unit, UnitCharge } from "./UnitsPage";
import { Badge } from "./ui/badge";

interface AddEditUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (unit: any) => void;
  unit?: Unit | null;
}

export function AddEditUnitDialog({ open, onOpenChange, onSave, unit }: AddEditUnitDialogProps) {
  const [unitNumber, setUnitNumber] = useState("");
  const [unitType, setUnitType] = useState<"3-bedroom" | "2-bedroom" | "1-bedroom" | "bedsitter" | "studio">("2-bedroom");
  const [baseRent, setBaseRent] = useState("");
  const [floor, setFloor] = useState("");
  const [squareFeet, setSquareFeet] = useState("");
  const [charges, setCharges] = useState<UnitCharge[]>([]);
  const [newChargeName, setNewChargeName] = useState("");
  const [newChargeAmount, setNewChargeAmount] = useState("");
  const [newChargeType, setNewChargeType] = useState<"fixed" | "variable">("fixed");
  const [newChargeOptional, setNewChargeOptional] = useState(false);

  useEffect(() => {
    if (unit) {
      setUnitNumber(unit.unitNumber);
      setUnitType(unit.unitType);
      setBaseRent(unit.baseRent.toString());
      setFloor(unit.floor?.toString() || "");
      setSquareFeet(unit.squareFeet?.toString() || "");
      setCharges(unit.charges);
    } else {
      resetForm();
    }
  }, [unit, open]);

  const resetForm = () => {
    setUnitNumber("");
    setUnitType("2-bedroom");
    setBaseRent("");
    setFloor("");
    setSquareFeet("");
    setCharges([]);
    setNewChargeName("");
    setNewChargeAmount("");
    setNewChargeType("fixed");
    setNewChargeOptional(false);
  };

  const handleAddCharge = () => {
    if (!newChargeName.trim() || !newChargeAmount) return;

    const charge: UnitCharge = {
      id: Date.now().toString(),
      name: newChargeName.trim(),
      amount: parseFloat(newChargeAmount),
      type: newChargeType,
      isOptional: newChargeOptional
    };

    setCharges([...charges, charge]);
    setNewChargeName("");
    setNewChargeAmount("");
    setNewChargeType("fixed");
    setNewChargeOptional(false);
  };

  const handleRemoveCharge = (chargeId: string) => {
    setCharges(charges.filter(c => c.id !== chargeId));
  };

  const handleSave = () => {
    if (!unitNumber.trim() || !baseRent) return;

    const unitData = {
      unitNumber: unitNumber.trim(),
      unitType,
      baseRent: parseFloat(baseRent),
      charges,
      floor: floor ? parseInt(floor) : undefined,
      squareFeet: squareFeet ? parseInt(squareFeet) : undefined,
      status: unit?.status || "vacant" as const,
      tenantId: unit?.tenantId,
    };

    if (unit) {
      onSave({ ...unitData, id: unit.id });
    } else {
      onSave(unitData);
    }

    onOpenChange(false);
    resetForm();
  };

  const getTotalRent = () => {
    const base = parseFloat(baseRent) || 0;
    const chargesTotal = charges
      .filter(c => !c.isOptional)
      .reduce((sum, c) => sum + c.amount, 0);
    return base + chargesTotal;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{unit ? "Edit Unit" : "Add New Unit"}</DialogTitle>
          <DialogDescription>
            {unit ? "Edit the details of the unit." : "Add a new unit to the property."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-neutral-900">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unitNumber">Unit Number *</Label>
                <Input
                  id="unitNumber"
                  placeholder="e.g., Unit 101"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="unitType">Unit Type *</Label>
                <Select value={unitType} onValueChange={(value: any) => setUnitType(value)}>
                  <SelectTrigger id="unitType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3-bedroom">3 Bedroom</SelectItem>
                    <SelectItem value="2-bedroom">2 Bedroom</SelectItem>
                    <SelectItem value="1-bedroom">1 Bedroom</SelectItem>
                    <SelectItem value="bedsitter">Bedsitter</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="floor">Floor (Optional)</Label>
                <Input
                  id="floor"
                  type="number"
                  placeholder="e.g., 1"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="squareFeet">Square Feet (Optional)</Label>
                <Input
                  id="squareFeet"
                  type="number"
                  placeholder="e.g., 850"
                  value={squareFeet}
                  onChange={(e) => setSquareFeet(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Rent Information */}
          <div className="space-y-4">
            <h3 className="text-neutral-900">Rent Information</h3>
            
            <div>
              <Label htmlFor="baseRent">Base Rent *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="baseRent"
                  type="number"
                  placeholder="2500"
                  value={baseRent}
                  onChange={(e) => setBaseRent(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Charges */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-neutral-900">Additional Charges</h3>
              <p className="text-neutral-600">Optional utilities and fees</p>
            </div>

            {/* Existing Charges */}
            {charges.length > 0 && (
              <div className="space-y-2">
                {charges.map((charge) => (
                  <div key={charge.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-900">{charge.name}</span>
                        <Badge variant={charge.isOptional ? "secondary" : "default"} className="text-xs">
                          {charge.isOptional ? "Optional" : "Required"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {charge.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-neutral-900">${charge.amount.toLocaleString()}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCharge(charge.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Charge */}
            <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
              <p className="text-neutral-700">Add New Charge</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="chargeName">Charge Name</Label>
                  <Input
                    id="chargeName"
                    placeholder="e.g., Water, Electricity"
                    value={newChargeName}
                    onChange={(e) => setNewChargeName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="chargeAmount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      id="chargeAmount"
                      type="number"
                      placeholder="50"
                      value={newChargeAmount}
                      onChange={(e) => setNewChargeAmount(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="chargeType">Type</Label>
                  <Select value={newChargeType} onValueChange={(value: any) => setNewChargeType(value)}>
                    <SelectTrigger id="chargeType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="variable">Variable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="chargeOptional"
                      checked={newChargeOptional}
                      onCheckedChange={(checked) => setNewChargeOptional(checked as boolean)}
                    />
                    <Label htmlFor="chargeOptional" className="cursor-pointer">
                      Optional charge
                    </Label>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleAddCharge}
                disabled={!newChargeName.trim() || !newChargeAmount}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Charge
              </Button>
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-neutral-700">Base Rent:</span>
              <span className="text-neutral-900">${parseFloat(baseRent || "0").toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-neutral-700">Required Charges:</span>
              <span className="text-neutral-900">
                ${charges.filter(c => !c.isOptional).reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
              </span>
            </div>
            <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between items-center">
              <span className="text-neutral-900">Total Monthly Rent:</span>
              <span className="text-neutral-900">${getTotalRent().toLocaleString()}</span>
            </div>
            {charges.some(c => c.isOptional) && (
              <p className="text-neutral-600 mt-2">
                + ${charges.filter(c => c.isOptional).reduce((sum, c) => sum + c.amount, 0).toLocaleString()} (optional charges)
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!unitNumber.trim() || !baseRent}>
            {unit ? "Update Unit" : "Add Unit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}