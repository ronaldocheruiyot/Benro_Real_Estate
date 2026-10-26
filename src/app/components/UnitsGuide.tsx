import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Home, DollarSign, Settings, Receipt, Info } from "lucide-react";

export function UnitsGuide() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Units Management Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertDescription>
            The Units Management system allows you to define properties, set rent prices, add charges, 
            and track payment allocations for each unit in your apartment.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="text-neutral-900 mb-1">1. Define Unit Properties</h4>
              <p className="text-neutral-600">
                Set unit type (3-bedroom, 2-bedroom, 1-bedroom, bedsitter, or studio), 
                floor number, and square footage for each unit.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div>
              <h4 className="text-neutral-900 mb-1">2. Set Base Rent</h4>
              <p className="text-neutral-600">
                Define the base monthly rent for each unit. This is the core rental amount 
                before any additional charges.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div>
              <h4 className="text-neutral-900 mb-1">3. Add Charges</h4>
              <p className="text-neutral-600">
                Add optional or required charges like water, electricity, garbage, parking, etc. 
                Set charges as fixed (same every month) or variable (may change).
              </p>
              <div className="mt-2 text-neutral-600">
                <span className="inline-block px-2 py-1 bg-neutral-100 rounded mr-2 mb-1">Required</span> 
                Must be paid every month
              </div>
              <div className="text-neutral-600">
                <span className="inline-block px-2 py-1 bg-neutral-100 rounded mr-2">Optional</span> 
                Tenant chooses whether to pay
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div>
              <h4 className="text-neutral-900 mb-1">4. Payment Allocation</h4>
              <p className="text-neutral-600">
                When recording cash payments, you can allocate the amount to specific charges. 
                This shows tenants exactly where their money goes and helps you track which charges are paid.
              </p>
              <p className="text-neutral-600 mt-2">
                Allocations appear on printed receipts and payment history, providing full transparency.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-neutral-900 mb-2">💡 <strong>Pro Tip:</strong></p>
          <p className="text-neutral-700">
            Link units to tenants by assigning tenants to specific units. This automatically 
            connects rent and charges to the correct unit, making payment tracking seamless.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
