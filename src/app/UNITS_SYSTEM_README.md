# Units Management System - User Guide

## Overview
The Units Management System is a comprehensive feature that allows you to manage property units, set rent prices, define charges, and track payment allocations in your apartment management application.

## Key Features

### 1. Unit Properties Management
- **Unit Types**: Define units as 3-bedroom, 2-bedroom, 1-bedroom, bedsitter, or studio
- **Physical Details**: Set floor number and square footage
- **Status Tracking**: Automatically tracks if a unit is occupied or vacant
- **Tenant Association**: View which tenant occupies each unit

### 2. Rent Structure
- **Base Rent**: Set the core monthly rental amount for each unit
- **Additional Charges**: Add multiple charges like:
  - Water (variable)
  - Electricity (variable)
  - Garbage collection (fixed)
  - Parking (optional)
  - Security fees (fixed)
  - Maintenance fees (optional)

### 3. Charge Types
- **Fixed Charges**: Same amount every month (e.g., parking, garbage)
- **Variable Charges**: Amount may change (e.g., water, electricity based on usage)
- **Required Charges**: Must be paid (included in total rent)
- **Optional Charges**: Tenant chooses whether to pay

### 4. Payment Allocation
When recording cash payments, you can allocate the payment amount to specific charges:
- Automatically distributes payment across charges
- Priority: Base Rent → Required Charges → Optional Charges
- Manual adjustment of allocations
- Real-time tracking of allocated vs unallocated amounts

### 5. Receipt Generation
Receipts show complete breakdown:
- Base rent allocation
- Each charge allocation
- Total amount paid
- Payment date and method
- Tenant information

## How to Use

### Adding a New Unit

1. Navigate to **Tenants** page for your apartment
2. Click on **Units Management** card
3. Click **Add Unit** button
4. Fill in unit details:
   - Unit Number (e.g., "Unit 101")
   - Unit Type (select from dropdown)
   - Base Rent amount
   - Optional: Floor and Square Feet

5. Add charges:
   - Enter charge name (e.g., "Water")
   - Set amount
   - Choose type (Fixed/Variable)
   - Mark as Optional if applicable
   - Click "Add Charge"

6. Review total monthly rent
7. Click **Add Unit**

### Editing an Existing Unit

1. Find the unit in the grid view
2. Click **Edit Unit** button
3. Modify any details
4. Add or remove charges
5. Click **Update Unit**

### Recording Payments with Allocations

1. Go to **Active Tenants** page
2. Find the tenant
3. Click **Cash Billing** action
4. The system will show:
   - Total payment amount field
   - Base rent allocation input
   - Each charge allocation input
   - Max amount for each charge
   - Total allocated vs payment amount

5. Enter total payment amount
6. Adjust allocations as needed (auto-distributed by default)
7. Add notes if needed
8. Click **Record Payment**
9. Optional: Print receipt showing allocations

### Viewing Unit Status

The Units page shows:
- **Total Units**: All units in the apartment
- **Occupied**: Units with active tenants
- **Vacant**: Available units
- **Monthly Revenue**: Expected income from occupied units

### Filtering Units

- **By Status**: View all, occupied only, or vacant only
- **By Type**: Filter by bedroom count or unit type
- **By Search**: Search by unit number

## Integration with Existing Features

### Tenant Assignment
- Units can be linked to tenants
- Tenant's rent automatically reflects unit's base rent + charges
- Payment history shows charge allocations

### Payment Tracking
- Cash billing supports charge allocation
- Payment history displays breakdown
- Receipts show where money was allocated

### Reporting
- Track which charges are paid/unpaid
- Monthly revenue calculations include all charges
- Occupancy rates and payment collection rates

## Best Practices

1. **Set Up Units First**: Create and configure units before adding tenants
2. **Use Consistent Naming**: Use clear unit numbers (e.g., "Unit 101", "Apartment 2B")
3. **Mark Optional Charges**: Clearly mark which charges are optional
4. **Regular Updates**: Update variable charges (water, electricity) monthly
5. **Track Allocations**: Always allocate payments to charges for accurate records
6. **Print Receipts**: Provide tenants with receipts showing charge breakdown

## Example Unit Setup

### Example 1: Basic 2-Bedroom Unit
- **Unit Number**: Unit 203
- **Type**: 2-bedroom
- **Base Rent**: $2,000
- **Charges**:
  - Water: $50 (Required, Variable)
  - Garbage: $20 (Required, Fixed)
  - Parking: $50 (Optional, Fixed)
- **Total Monthly**: $2,070 (or $2,120 with parking)

### Example 2: Studio with Utilities
- **Unit Number**: Studio 15
- **Type**: Studio
- **Base Rent**: $1,200
- **Charges**:
  - Electricity: $80 (Required, Variable)
  - Internet: $30 (Optional, Fixed)
- **Total Monthly**: $1,280 (or $1,310 with internet)

## Technical Notes

### Data Structure
```typescript
interface Unit {
  id: string;
  unitNumber: string;
  unitType: "3-bedroom" | "2-bedroom" | "1-bedroom" | "bedsitter" | "studio";
  baseRent: number;
  charges: UnitCharge[];
  status: "occupied" | "vacant";
  tenantId?: string;
  floor?: number;
  squareFeet?: number;
}

interface UnitCharge {
  id: string;
  name: string;
  amount: number;
  isOptional: boolean;
  type: "fixed" | "variable";
}
```

### Payment Allocation
Payments now support an `allocations` field:
```typescript
interface ChargeAllocation {
  chargeId: string;
  chargeName: string;
  allocatedAmount: number;
  isBaseRent?: boolean;
}
```

## Troubleshooting

**Q: Can I change charges after tenants move in?**
A: Yes, but coordinate with tenants about any price changes. Variable charges can be adjusted monthly.

**Q: What happens if payment is less than total rent?**
A: The system allows partial payment allocation. Unallocated amounts are tracked.

**Q: Can I have different charges for different units?**
A: Yes, each unit has its own independent charge structure.

**Q: How do I handle security deposits?**
A: Add a security deposit as an optional one-time charge, or track separately in notes.

## Future Enhancements

Planned features:
- Automatic late fees
- Lease agreement attachments
- Bulk unit import
- Charge templates
- Historical charge tracking
- Utility meter readings integration
