# Units Management System - Workflow Diagram

## User Journey Flow

```
┌─────────────────┐
│  Login Screen   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Dashboard     │ (View all apartments)
└────────┬────────┘
         │ Click "View Tenants" on apartment
         ▼
┌─────────────────────────────────────────┐
│         Tenants Overview Page           │
│  ┌────────┐  ┌────────┐  ┌──────────┐  │
│  │ Active │  │Vacant  │  │ Failed   │  │
│  │Tenants │  │Units   │  │ to Pay   │  │
│  └────────┘  └────────┘  └──────────┘  │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │    Units     │  │  Activity Log   │ │
│  │ Management ◄─┼──┼── Click Here    │ │
│  └──────┬───────┘  └─────────────────┘ │
└─────────┼─────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────┐
│      UNITS MANAGEMENT PAGE               │
├──────────────────────────────────────────┤
│                                          │
│  📊 Statistics Dashboard                 │
│  ┌─────────┬─────────┬─────────┬───────┐│
│  │ Total   │Occupied │ Vacant  │Revenue││
│  │ Units   │   12    │   3     │$30K   ││
│  └─────────┴─────────┴─────────┴───────┘│
│                                          │
│  🔍 Filters & Search                     │
│  [Search...] [Status▼] [Type▼]          │
│                                          │
│  📋 Units Grid                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │Unit 101  │ │Unit 102  │ │Unit 103  ││
│  │Occupied  │ │ Vacant   │ │Occupied  ││
│  │          │ │          │ │          ││
│  │👤 John   │ │  ---     │ │👤 Mary   ││
│  │Base:$2000│ │Base:$2500│ │Base:$1800││
│  │Water: $50│ │Water: $60│ │Water: $45││
│  │Elec: $80 │ │Elec:$100 │ │Elec: $70 ││
│  │────────  │ │────────  │ │────────  ││
│  │Total:    │ │Total:    │ │Total:    ││
│  │ $2,150   │ │ $2,660   │ │ $1,915   ││
│  │          │ │          │ │          ││
│  │[Edit]    │ │[Edit]    │ │[Edit]    ││
│  └──────────┘ └──────────┘ └──────────┘│
│                                          │
│                    [+ Add Unit]          │
└──────────────────────────────────────────┘
```

## Adding a Unit Workflow

```
Click [+ Add Unit]
       │
       ▼
┌─────────────────────────────────┐
│   Add Unit Dialog               │
├─────────────────────────────────┤
│                                 │
│ 📝 Basic Info                   │
│  Unit Number: [Unit 104    ]   │
│  Type: [2-bedroom ▼]            │
│  Floor: [2]  Sq Ft: [850]      │
│                                 │
│ 💰 Rent                         │
│  Base Rent: [$2000]             │
│                                 │
│ ⚡ Charges                       │
│  ┌─────────────────────────┐   │
│  │ Water      $50  Variable│   │
│  │ Required     [Remove]   │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Electricity $80 Variable│   │
│  │ Required     [Remove]   │   │
│  └─────────────────────────┘   │
│                                 │
│  Add New Charge:                │
│  Name: [Parking        ]        │
│  Amount: [$50]                  │
│  Type: [Fixed ▼]                │
│  ☐ Optional                     │
│  [+ Add Charge]                 │
│                                 │
│ 📊 Summary                      │
│  Base Rent:        $2,000       │
│  Required Charges:   $130       │
│  ─────────────────────────      │
│  Total Monthly:    $2,130       │
│                                 │
│  [Cancel]  [Add Unit]           │
└─────────────────────────────────┘
```

## Payment with Charge Allocation Workflow

```
Active Tenants Page
       │
       ▼ Click "Cash Bill"
┌─────────────────────────────────────┐
│   Cash Billing Dialog               │
├─────────────────────────────────────┤
│                                     │
│ 💵 Payment Details                  │
│  Amount: [$2150.00]                 │
│  Date: [2024-10-15]                 │
│                                     │
│ 📊 Allocation                       │
│  Status: [Fully Allocated ✓]       │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Base Rent        Max: $2000  │  │
│  │ Allocated: [$2000.00]        │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Water (Required) Max: $50    │  │
│  │ Allocated: [$50.00]          │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Electricity (Req) Max: $80   │  │
│  │ Allocated: [$80.00]          │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Garbage (Req)    Max: $20    │  │
│  │ Allocated: [$20.00]          │  │
│  └──────────────────────────────┘  │
│                                     │
│  Total Allocated: $2,150.00         │
│  Payment Amount:  $2,150.00         │
│                                     │
│ 📝 Notes (Optional)                 │
│  [Monthly rent - October]           │
│                                     │
│  [Cancel] [Print] [Record Payment]  │
└─────────────────────────────────────┘
       │
       ▼ Click "Record Payment"
┌─────────────────────────────────────┐
│  ✓ Payment Recorded Successfully!   │
└─────────────────────────────────────┘
```

## Printable Receipt Layout

```
┌────────────────────────────────────┐
│   RENTAL MANAGEMENT SYSTEM         │
│      Cash Payment Receipt          │
├────────────────────────────────────┤
│                                    │
│ TENANT INFORMATION                 │
│  Name:       John Doe              │
│  ID:         0712345678            │
│  Unit:       Unit 101              │
│  Email:      john@example.com     │
│                                    │
│ PAYMENT DETAILS                    │
│  Date:       Oct 15, 2024          │
│  Method:     Cash                  │
│                                    │
│ PAYMENT ALLOCATION                 │
│  Base Rent           $2,000.00     │
│  Water                  $50.00     │
│  Electricity            $80.00     │
│  Garbage                $20.00     │
│                                    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  TOTAL PAID          $2,150.00     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                    │
│ Thank you for your payment!        │
│                                    │
│ Generated: Oct 15, 2024 2:30 PM    │
└────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────┐
│   USER   │
└────┬─────┘
     │
     ├─── Create/Edit Unit ──────────┐
     │                               │
     │                               ▼
     │                        ┌──────────────┐
     │                        │ Units State  │
     │                        │   (App.tsx)  │
     │                        └──────┬───────┘
     │                               │
     │                               ├─── Calculate Stats
     │                               ├─── Track Occupancy
     │                               └─── Link to Tenants
     │
     ├─── Record Payment ────────────┐
     │                               │
     │                               ▼
     │                        ┌──────────────────┐
     │                        │ Payment + Alloc  │
     │                        │  (Payments State)│
     │                        └──────┬───────────┘
     │                               │
     │                               ├─── Save Record
     │                               ├─── Update History
     │                               └─── Print Receipt
     │
     └─── View/Filter Units ─────────┐
                                     │
                                     ▼
                              ┌──────────────┐
                              │ Filtered     │
                              │ Display      │
                              └──────────────┘
```

## System Integration Map

```
                    UNITS MANAGEMENT
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────┐      ┌──────────┐      ┌──────────┐
   │ Tenants │      │ Payments │      │ Reports  │
   │  System │      │  System  │      │  System  │
   └────┬────┘      └────┬─────┘      └────┬─────┘
        │                │                  │
        │                │                  │
   ┌────▼────────────────▼──────────────────▼────┐
   │                                              │
   │  • Unit Assignment                           │
   │  • Rent Calculation                          │
   │  • Charge Allocation                         │
   │  • Receipt Generation                        │
   │  • Revenue Tracking                          │
   │  • Occupancy Metrics                         │
   │                                              │
   └──────────────────────────────────────────────┘
```

## User Action → System Response

```
┌─────────────────────────┬──────────────────────────┐
│   User Action           │  System Response         │
├─────────────────────────┼──────────────────────────┤
│ Click "Units Mgmt"      │ Show units page with     │
│                         │ stats and grid           │
├─────────────────────────┼──────────────────────────┤
│ Click "Add Unit"        │ Open dialog with form    │
├─────────────────────────┼──────────────────────────┤
│ Fill unit details       │ Validate input           │
├─────────────────────────┼──────────────────────────┤
│ Add charge              │ Update charge list       │
│                         │ Recalculate total        │
├─────────────────────────┼──────────────────────────┤
│ Save unit               │ Add to units array       │
│                         │ Update statistics        │
│                         │ Close dialog             │
├─────────────────────────┼──────────────────────────┤
│ Search/Filter           │ Filter visible units     │
│                         │ Update display           │
├─────────────────────────┼──────────────────────────┤
│ Click "Edit Unit"       │ Open dialog pre-filled   │
├─────────────────────────┼──────────────────────────┤
│ Modify & Save           │ Update unit in array     │
│                         │ Recalculate stats        │
├─────────────────────────┼──────────────────────────┤
│ Click "Cash Bill"       │ Open payment dialog      │
│                         │ Load unit charges        │
│                         │ Initialize allocations   │
├─────────────────────────┼──────────────────────────┤
│ Enter payment amount    │ Auto-distribute to       │
│                         │ charges                  │
├─────────────────────────┼──────────────────────────┤
│ Adjust allocation       │ Update allocation        │
│                         │ Show unallocated amount  │
├─────────────────────────┼──────────────────────────┤
│ Record payment          │ Save with allocations    │
│                         │ Update payment history   │
├─────────────────────────┼──────────────────────────┤
│ Click "Print"           │ Generate receipt         │
│                         │ Show charge breakdown    │
└─────────────────────────┴──────────────────────────┘
```

## State Management Flow

```
┌────────────────────────────────────────────┐
│              App.tsx (Root)                │
│                                            │
│  State:                                    │
│    ├─ units: Unit[]                        │
│    ├─ tenants: Tenant[]                    │
│    ├─ payments: Payment[]                  │
│    └─ currentView: View                    │
│                                            │
│  Methods:                                  │
│    ├─ setUnits()                           │
│    ├─ setTenants()                         │
│    ├─ setPayments()                        │
│    └─ setCurrentView()                     │
└──────────────┬─────────────────────────────┘
               │
               ├─── UnitsPage
               │      │
               │      ├─ Displays: units
               │      ├─ Updates: setUnits
               │      └─ Uses: tenants (read)
               │
               ├─── ActiveTenantsPage
               │      │
               │      ├─ Displays: tenants
               │      ├─ Uses: units (for billing)
               │      └─ Updates: setPayments
               │
               └─── PaymentHistoryPage
                      │
                      ├─ Displays: payments
                      └─ Shows: allocations
```

## Responsive Design Flow

```
                Desktop (>1024px)
┌────────────────────────────────────────────┐
│  Stats: 4 columns                          │
│  Units Grid: 3 columns                     │
│  Filters: Horizontal row                   │
└────────────────────────────────────────────┘

                Tablet (768-1024px)
┌────────────────────────────────────────────┐
│  Stats: 2 columns                          │
│  Units Grid: 2 columns                     │
│  Filters: Horizontal row                   │
└────────────────────────────────────────────┘

                Mobile (<768px)
┌────────────────────────────────────────────┐
│  Stats: 1 column                           │
│  Units Grid: 1 column                      │
│  Filters: Stacked vertically               │
│  Dialog: Full screen                       │
└────────────────────────────────────────────┘
```

## Quick Reference: Key Files

```
/components/
  ├─ UnitsPage.tsx              ← Main units page
  ├─ AddEditUnitDialog.tsx      ← Add/edit dialog
  ├─ CashBillingWithChargesDialog.tsx  ← Payment allocation
  ├─ UnitsGuide.tsx             ← Help guide
  └─ TenantsPage.tsx            ← Navigation link

/
  ├─ UNITS_SYSTEM_README.md     ← Full documentation
  ├─ HOW_TO_USE_UNITS.md        ← Quick start guide
  ├─ IMPLEMENTATION_SUMMARY.md  ← Technical summary
  └─ UNITS_WORKFLOW.md          ← This file
```
