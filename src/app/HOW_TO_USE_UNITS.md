# Quick Start: Units Management System

## Accessing Units Management

1. **Login** to your apartment management system
2. **Select an Apartment** from the dashboard
3. Click **View Tenants** on the apartment card
4. On the Tenants page, find the **Units Management** card (blue card with home icon)
5. Click on it to access the Units Management page

## What You'll See

### Units Dashboard
- **Statistics**: Total units, occupied, vacant, and monthly revenue
- **Filters**: Search by unit number, filter by status or type
- **Unit Cards**: Each showing:
  - Unit number and type
  - Occupancy status
  - Tenant info (if occupied)
  - Base rent
  - List of charges
  - Total monthly rent
  - Edit button

### Getting Started Guide
- A collapsible guide explaining the system
- Can be hidden/shown with the "Hide/Show Guide" button

## Quick Tasks

### Add Your First Unit

```
1. Click "Add Unit" button (top right)
2. Fill in:
   - Unit Number: "Unit 101"
   - Unit Type: Select "2-bedroom"
   - Base Rent: Enter 2000
   - Floor: 1 (optional)
   - Square Feet: 850 (optional)

3. Add charges:
   - Charge Name: "Water"
   - Amount: 50
   - Type: Variable
   - Check "Optional charge" if applicable
   - Click "Add Charge"

4. Repeat for other charges (Electricity, Garbage, etc.)
5. Review the total monthly rent calculation
6. Click "Add Unit"
```

### Edit an Existing Unit

```
1. Find the unit card in the grid
2. Click "Edit Unit" button
3. Modify any field
4. Add/remove charges using the same interface
5. Click "Update Unit"
```

### View Unit Details

Each unit card displays:
- **Header**: Unit number, type, status badge
- **Tenant Section**: Avatar, name, email (if occupied)
- **Rent Breakdown**:
  - Base Rent: $X,XXX
  - Charges: Listed individually with amounts
  - Total Monthly: Sum of all required charges

## Using with Tenants

### Assigning Tenants to Units

When you add a new tenant:
1. The tenant's rent should match the unit's total rent
2. The unit status automatically changes to "occupied"
3. The tenant card shows which unit they occupy

### Recording Payments with Allocations

When using Cash Billing:
1. The system detects if the tenant's unit has defined charges
2. Shows allocation interface automatically
3. Distributes payment across:
   - Base rent first
   - Required charges second
   - Optional charges last
4. You can manually adjust allocations
5. Print receipt shows the breakdown

## Common Scenarios

### Scenario 1: Standard Rental Unit
**Setup**: 2-bedroom unit with utilities included in separate charges
- Base Rent: $2,000
- Water: $50 (required, variable)
- Electricity: $80 (required, variable)  
- Garbage: $20 (required, fixed)
- **Total**: $2,150/month

### Scenario 2: Premium Unit with Optional Services
**Setup**: 3-bedroom with parking option
- Base Rent: $2,500
- Water: $60 (required, variable)
- Electricity: $100 (required, variable)
- Parking: $50 (optional, fixed)
- **Total**: $2,660/month (or $2,710 with parking)

### Scenario 3: Basic Studio
**Setup**: All-inclusive studio
- Base Rent: $1,200
- No additional charges
- **Total**: $1,200/month

## Tips

✅ **Do**:
- Set up units before adding tenants
- Use clear unit numbering (e.g., "Unit 101", "Apt 2B")
- Mark optional charges clearly
- Update variable charges monthly
- Always allocate payments to charges

❌ **Don't**:
- Change required charges without tenant notification
- Leave units without base rent
- Forget to update occupancy status

## Navigation

**To Units Management**: Dashboard → Apartment → View Tenants → Units Management

**From Units Management**:
- "Back to Tenants" → Returns to Tenants overview
- Top navigation bar → Navigate to other sections

## Key Features

🏠 **Unit Properties**: Type, floor, square footage  
💰 **Flexible Pricing**: Base rent + customizable charges  
📊 **Auto Calculations**: Total rent computed automatically  
📋 **Charge Types**: Fixed or variable, required or optional  
🧾 **Payment Allocations**: Track where money goes  
📄 **Printable Receipts**: Show charge breakdowns  
📈 **Statistics**: Occupancy and revenue tracking  

## Need Help?

- Click "Show Guide" button for detailed explanation
- Hover over badges for charge types
- Check the status badge for occupancy
- Use filters to find specific units

## Integration Points

The Units system connects with:
- **Tenant Management**: Unit assignment
- **Payment System**: Charge allocation
- **Cash Billing**: Automatic breakdown
- **Reports**: Revenue calculations
- **Activity Log**: Tracks all changes
