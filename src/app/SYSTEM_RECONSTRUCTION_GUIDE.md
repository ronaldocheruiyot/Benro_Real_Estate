# Real Estate Management System - Role-Based Reconstruction Guide

## System Overview

This system has been completely reconstructed based on proper role-based access control (RBAC) with four distinct user roles, each with specific duties and system access levels.

## User Roles & Duties

### 1. PROPERTY MANAGER (Oversight & Approval)
**Role Type:** Oversight, approval & control  
**System Access Level:** Full operational access (no direct data entry)

**System Duties:**
- ✅ Approve landlord onboarding and property listings
- ✅ Approve house advertisements and rental pricing
- ✅ Approve tenant allocation to units
- ✅ Approve and authorize lease terms
- ✅ Approve tenant account activation
- ✅ Approve maintenance budgets and major repairs
- ✅ Review financial summaries and performance reports
- ✅ Resolve escalated tenant, landlord, and staff issues
- ✅ Suspend or terminate tenant accounts when necessary

**Navigation Access:**
- Dashboard
- **Approval Center** (Primary workspace)
- Properties (Read-only)
- Tenant Management (Read-only)
- Financial Reports (Read-only)
- Budgets (Approval only)
- Advertisements (Approval only)

### 2. ADMINISTRATOR (Account Creation & Records)
**Role Type:** Account creation, records & coordination  
**System Access Level:** Create & manage records (no financial approvals)

**System Duties:**
- ✅ Create tenant user accounts in the system
- ✅ Generate and issue temporary login credentials
- ✅ Create and manage landlord accounts
- ✅ Capture and upload documents (Leases, Ownership documents, Permits, Tenant identification)
- ✅ Create, publish, and update property listings
- ✅ Link tenants to properties, units, and leases
- ✅ Send system notices (rent reminders, notices to vacate)
- ✅ Log complaints and maintenance requests
- ✅ Schedule inspections and viewings
- ✅ Activate tenant accounts after approval

**Navigation Access:**
- Dashboard
- Properties (Full CRUD)
- Tenant Management (Full CRUD)
- **Documents** (Upload & manage)
- Advertisements (Create, submit for approval)

### 3. ACCOUNTANT (Financial Control & Compliance)
**Role Type:** Financial control & compliance  
**System Access Level:** Finance-only access (read-only on operations)

**System Duties:**
- ✅ Record rent payments, deposits, and penalties
- ✅ Generate invoices and receipts
- ✅ Track tenant balances and arrears
- ✅ Record maintenance and operational expenses
- ✅ Prepare financial reports (monthly, annual)
- ✅ Confirm financial compliance before tenant activation
- ✅ Manage budgets and expense categories
- ✅ Reconcile bank and cash accounts
- ✅ Flag financial irregularities for management review

**Navigation Access:**
- Dashboard
- **Financial Reports**
- **Payments** (Record & manage)
- **Budgets** (Create & manage)

### 4. CARETAKER (On-site Operations & Reporting)
**Role Type:** On-site operations & reporting  
**System Access Level:** Limited task-based access

**System Duties:**
- ✅ Report maintenance issues through the system
- ✅ Receive and update assigned maintenance tasks
- ✅ Upload photos/videos of repairs, inspections, property condition
- ✅ Conduct move-in and move-out inspections
- ✅ Record utility meter readings
- ✅ Enforce house rules on-site
- ✅ Report incidents and emergencies
- ✅ Update task status (Pending → In Progress → Completed)

**Navigation Access:**
- Dashboard
- **Maintenance Tasks** (Report & update)
- **Inspections** (Schedule & conduct)

## Login Credentials (Unchanged)

```
Property Manager:
  Email: manager@company.com
  Password: manager123

Administrator:
  Email: admin@company.com
  Password: admin123

Accountant:
  Email: accountant@company.com
  Password: accountant123

Caretaker:
  Email: caretaker@company.com
  Password: caretaker123
```

## New Features & Pages

### 1. Approval Center (Property Manager Only)
- Review pending property listings
- Approve/reject tenant allocations
- Approve/reject advertisements
- Approve maintenance budgets
- Approve lease terms
- Activate tenant accounts
- Dashboard with approval metrics

### 2. Documents Management (Administrator Only)
- Upload leases
- Upload ownership documents
- Upload building permits
- Upload tenant identification
- Organize by property or tenant
- Track approval status
- Search and filter documents

### 3. Maintenance Tasks (Caretaker Primary)
- Report new maintenance issues
- Update task status
- Upload photos/videos
- Assign priorities
- Track costs
- View task history
- Filter by property

### 4. Inspections (Caretaker Primary)
- Schedule inspections (move-in, move-out, routine, emergency)
- Conduct inspections with checklists
- Record utility meter readings
- Upload inspection photos
- Rate property condition
- Track completion

### 5. Payments Management (Accountant Only)
- Record rent payments
- Record deposits
- Record penalties
- Generate invoices
- Generate receipts
- Track balances
- Flag irregularities

### 6. Budgets Management (Accountant & Property Manager)
- Accountant: Create and manage budgets
- Property Manager: Approve maintenance budgets
- Track spending
- Budget utilization metrics
- Expense categories

## Permission Matrix

| Permission | Property Manager | Administrator | Accountant | Caretaker |
|-----------|-----------------|---------------|------------|-----------|
| Approve Property Listings | ✅ | ❌ | ❌ | ❌ |
| Approve Advertisements | ✅ | ❌ | ❌ | ❌ |
| Approve Tenant Allocation | ✅ | ❌ | ❌ | ❌ |
| Approve Lease Terms | ✅ | ❌ | ❌ | ❌ |
| Approve Tenant Accounts | ✅ | ❌ | ❌ | ❌ |
| Approve Maintenance Budgets | ✅ | ❌ | ❌ | ❌ |
| View Financial Summaries | ✅ | ❌ | ✅ | ❌ |
| Suspend/Terminate Accounts | ✅ | ❌ | ❌ | ❌ |
| Create Tenant Accounts | ❌ | ✅ | ❌ | ❌ |
| Create Landlord Accounts | ❌ | ✅ | ❌ | ❌ |
| Generate Credentials | ❌ | ✅ | ❌ | ❌ |
| Upload Documents | ❌ | ✅ | ❌ | ❌ |
| Create Property Listings | ❌ | ✅ | ❌ | ❌ |
| Link Tenants to Units | ❌ | ✅ | ❌ | ❌ |
| Send Notices | ❌ | ✅ | ❌ | ❌ |
| Log Complaints | ❌ | ✅ | ❌ | ❌ |
| Schedule Inspections | ❌ | ✅ | ❌ | ❌ |
| Activate Tenant Accounts | ❌ | ✅ | ❌ | ❌ |
| Record Payments | ❌ | ❌ | ✅ | ❌ |
| Generate Invoices | ❌ | ❌ | ✅ | ❌ |
| Track Balances | ✅ (view) | ❌ | ✅ | ❌ |
| Record Expenses | ❌ | ❌ | ✅ | ❌ |
| Prepare Financial Reports | ❌ | ❌ | ✅ | ❌ |
| Manage Budgets | ❌ | ❌ | ✅ | ❌ |
| Reconcile Accounts | ❌ | ❌ | ✅ | ❌ |
| Flag Irregularities | ❌ | ❌ | ✅ | ❌ |
| Report Maintenance | ❌ | ❌ | ❌ | ✅ |
| Update Maintenance Tasks | ❌ | ❌ | ❌ | ✅ |
| Upload Inspection Media | ❌ | ❌ | ❌ | ✅ |
| Conduct Inspections | ❌ | ❌ | ❌ | ✅ |
| Record Utility Readings | ❌ | ❌ | ❌ | ✅ |
| Report Incidents | ❌ | ❌ | ❌ | ✅ |
| Update Task Status | ❌ | ❌ | ❌ | ✅ |

## System Control & Security (Automated)

The system automatically handles:
- ✅ Role-based access control enforcement
- ✅ Forced password change on first login (planned)
- ✅ Audit logs for all actions (planned)
- ✅ Account status management (Pending / Active / Suspended)
- ✅ Automated alerts and reminders (planned)
- ✅ Data backup and integrity checks (planned)

## Key Architectural Changes

1. **Type System**: Moved from scattered types to centralized `/types/roles.ts`
2. **Permission-Based UI**: Navigation dynamically shows/hides based on user permissions
3. **Workflow States**: Properties, tenants, and budgets now have approval workflows
4. **Document Management**: New document upload and tracking system
5. **Task Management**: Maintenance tasks with status tracking
6. **Inspection System**: Comprehensive inspection scheduling and execution

## Migration Notes

- ✅ All existing login credentials remain unchanged
- ✅ UserRole type replaced with UserAccount from `/types/roles.ts`
- ✅ defaultPermissionsByRole now imported from `/types/roles.ts`
- ⚠️ Some older components may still import from UserManagementPage - these should be updated
- ✅ Navigation component now role-aware
- ✅ New pages created: ApprovalCenterPage, DocumentsManagementPage, MaintenanceTasksPage, InspectionsPage, PaymentsManagementPage, BudgetsManagementPage

## Next Steps for Full Implementation

1. Update remaining components to import from `/types/roles.ts`
2. Add approval workflow to TenantsByApartmentPage
3. Add approval workflow to AdvertisementPage
4. Implement PDF generation for invoices and receipts
5. Implement audit log tracking
6. Add email notification system
7. Implement first-login password change
8. Add data export functionality to all reports
9. Implement search and filter across all pages
10. Add bulk operations support

## Testing the System

1. Log in as each role using the credentials above
2. Verify navigation shows only permitted items
3. Test creating data (Administrator)
4. Test approving data (Property Manager)
5. Test recording finances (Accountant)
6. Test reporting maintenance (Caretaker)
7. Verify access denial messages for unauthorized actions

## Support

For questions about the system architecture or role duties, refer to this guide or the `/types/roles.ts` file which contains the complete permission definitions.
