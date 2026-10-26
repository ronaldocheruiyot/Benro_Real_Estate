# Role-Based Access Control System - Implementation Guide

## Overview
Your apartment management application now features a comprehensive Role-Based Access Control (RBAC) system with 5 distinct user roles, each with specific duties and permissions aligned with real estate management workflows.

## User Roles

### 1. 🧠 Property Manager
**Type:** Oversight, Approval & Control  
**Access Level:** Full operational access (no direct data entry)

**System Duties:**
- Approve landlord onboarding and property listings
- Approve house advertisements and rental pricing
- Approve tenant allocation to units
- Approve and authorize lease terms
- Approve tenant account activation
- Approve maintenance budgets and major repairs
- Review financial summaries and performance reports
- Resolve escalated tenant, landlord, and staff issues
- Suspend or terminate tenant accounts when necessary

**Cannot:**
- Create accounts directly
- Enter financial data
- Perform day-to-day operations

**Login Credentials (Demo):**
- Email: `pm@company.com`
- Password: `pm123`

---

### 2. 📂 Administrator
**Type:** Account Creation, Records & Coordination  
**Access Level:** Create & manage records (no financial approvals)

**System Duties:**
- Create tenant user accounts in the system
- Generate and issue temporary login credentials
- Create and manage landlord accounts
- Capture and upload documents (leases, ownership documents, permits, tenant IDs)
- Create, publish, and update property listings
- Link tenants to properties, units, and leases
- Send system notices (rent reminders, notices to vacate)
- Log complaints and maintenance requests
- Schedule inspections and viewings
- Activate tenant accounts after approval

**Cannot:**
- Approve major decisions
- Access financial operations
- Delete critical data

**Login Credentials (Demo):**
- Email: `admin@company.com`
- Password: `admin123`

---

### 3. 💰 Accountant
**Type:** Financial Control & Compliance  
**Access Level:** Finance-only access (read-only on operations)

**System Duties:**
- Record rent payments, deposits, and penalties
- Generate invoices and receipts
- Track tenant balances and arrears
- Record maintenance and operational expenses
- Prepare financial reports (monthly, annual)
- Confirm financial compliance before tenant activation
- Manage budgets and expense categories
- Reconcile bank and cash accounts
- Flag financial irregularities for management review

**Cannot:**
- Modify tenant or unit data
- Create user accounts
- Approve budgets

**Login Credentials (Demo):**
- Email: `accountant@company.com`
- Password: `accountant123`

---

### 4. 🧹🔧 Caretaker
**Type:** On-Site Operations & Reporting  
**Access Level:** Limited task-based access (assigned properties only)

**System Duties:**
- Report maintenance issues through the system
- Receive and update assigned maintenance tasks
- Upload photos/videos of repairs, inspections, property condition
- Conduct move-in and move-out inspections
- Record utility meter readings
- Enforce house rules on-site
- Report incidents and emergencies
- Update task status (Pending → In Progress → Completed)

**Cannot:**
- Access financial data
- View other properties (only assigned ones)
- Manage tenant accounts

**Login Credentials (Demo):**
- Email: `caretaker@company.com`
- Password: `caretaker123`

---

### 5. 🧑‍💻 Tenant
**Type:** Self-Service User  
**Access Level:** Personal account only (no system management)

**System Duties:**
- Log in using credentials issued by Administrator
- Change password on first login (forced)
- View lease details and account balance
- View payment history
- Submit maintenance requests
- Submit complaints and notices to vacate
- Upload move-in and move-out photos
- Receive notices and receipts

**Cannot:**
- Access system management
- View other tenants' data
- Modify property information

**Login Credentials (Demo):**
- Email: `tenant@company.com`
- Password: `tenant123`

---

## New Features

### 1. Approval Center (Property Manager Only)
A dedicated page where Property Managers can:
- View all pending approval requests
- Approve or reject property listings
- Approve or reject tenant allocations
- Approve or reject maintenance budgets
- Approve or reject advertisements
- Track approval history

**Access:** Navigate to "Approval Center" in the navigation bar (visible only to Property Managers)

### 2. Tenant Dashboard
A self-service portal for tenants featuring:
- Lease details and account balance
- Payment history with downloadable receipts
- Maintenance request submission
- Complaint submission
- Current charges breakdown

**Access:** Automatically displayed when a tenant logs in

### 3. Role Permissions Guide
Comprehensive documentation of all role duties and permissions:
- Interactive tabbed interface
- Detailed breakdown of each role's responsibilities
- Visual permission matrix
- Quick reference table

**Access:** Help & Support → Role Permissions tab

### 4. Enhanced User Management
- Auto-generated secure passwords
- Email notification system (simulated)
- Account status tracking (Pending/Active/Inactive/Suspended)
- Forced password change on first login
- Property assignment for caretakers
- Detailed role descriptions

---

## System Control & Security Features

### Automated Features
1. **Role-based access control (RBAC)** - Automatic permission enforcement
2. **Forced password change** - Users must change password on first login
3. **Auto-generated passwords** - Secure random passwords for new users
4. **Account status management** - Pending/Active/Suspended states
5. **Audit logs** - All actions tracked with timestamps
6. **Email notifications** - Automated credential delivery (simulated)

### Security Features
1. **Session management** - Secure login/logout
2. **Permission validation** - All actions checked against user permissions
3. **Data isolation** - Users only see data they're authorized to access
4. **Password requirements** - Strong password generation
5. **Account suspension** - Property Managers can suspend accounts

---

## Navigation Changes

### Property Manager Navigation
- Dashboard
- **Approval Center** (NEW)
- Houses
- Tenants Mgmt
- Financial Reports
- Advertisements
- User Management

### Administrator Navigation
- Dashboard
- Houses
- Tenants Mgmt
- Financial Reports
- Advertisements
- User Management

### Accountant Navigation
- Dashboard
- Financial Reports
- Tenants Mgmt (view only)

### Caretaker Navigation
- Dashboard
- Houses (assigned properties only)

### Tenant Navigation
- Dashboard (personal tenant dashboard)

---

## Permission Matrix

| Action | Property Mgr | Admin | Accountant | Caretaker | Tenant |
|--------|--------------|-------|------------|-----------|--------|
| Create user accounts | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve tenant allocation | ✅ | ❌ | ❌ | ❌ | ❌ |
| Record payments | ❌ | ❌ | ✅ | ❌ | ❌ |
| Report maintenance | ❌ | ✅ | ❌ | ✅ | ✅ |
| View financial reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| Suspend accounts | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage properties | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve budgets | ✅ | ❌ | ❌ | ❌ | ❌ |
| View all properties | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update task status | ❌ | ✅ | ❌ | ✅ | ❌ |

---

## How to Test

### Testing Property Manager Role
1. Login with: `pm@company.com` / `pm123`
2. Navigate to "Approval Center"
3. Review pending approvals
4. Approve or reject items
5. View audit logs and reports

### Testing Administrator Role
1. Login with: `admin@company.com` / `admin123`
2. Navigate to "User Management"
3. Create a new user account
4. Check browser console for simulated email
5. Manage properties and tenants

### Testing Accountant Role
1. Login with: `accountant@company.com` / `accountant123`
2. Navigate to "Financial Reports"
3. Record payments
4. Generate reports
5. Note: Cannot access tenant management

### Testing Caretaker Role
1. Login with: `caretaker@company.com` / `caretaker123`
2. View assigned properties only
3. Report maintenance issues
4. Update task status
5. Note: Cannot access financial data

### Testing Tenant Role
1. Login with: `tenant@company.com` / `tenant123`
2. View personal dashboard
3. Submit maintenance request
4. View payment history
5. Note: Cannot access system management

---

## Code Changes Summary

### Updated Files
1. **UserManagementPage.tsx** - New role definitions and permissions
2. **LoginForm.tsx** - Updated with new roles
3. **Navigation.tsx** - Role-based navigation visibility
4. **App.tsx** - Added tenant dashboard routing
5. **AddUserDialog.tsx** - Updated role selection
6. **HelpSupportPage.tsx** - Added role permissions guide
7. **ApartmentDashboard.tsx** - Updated permission checks
8. **HousesManagementPage.tsx** - Updated permission checks

### New Files
1. **ApprovalCenterPage.tsx** - Approval workflow for Property Managers
2. **TenantDashboardPage.tsx** - Self-service portal for tenants
3. **RolePermissionsGuide.tsx** - Interactive role documentation
4. **ROLE_BASED_ACCESS_CONTROL_GUIDE.md** - This documentation

---

## Future Enhancements

1. **Backend Integration** - Connect to real database and email service
2. **Advanced Approval Workflows** - Multi-step approval chains
3. **Real-time Notifications** - WebSocket-based live updates
4. **Mobile App** - Native mobile apps for tenants and caretakers
5. **Document Storage** - Cloud-based document management
6. **Payment Gateway** - Online rent payment integration
7. **Maintenance Tracking** - Advanced task management system
8. **Reporting Dashboard** - Advanced analytics and insights

---

## Support

For questions or issues:
- View the Role Permissions Guide: Help & Support → Role Permissions
- Contact your system administrator
- Refer to the permission matrix above

---

## Version History

**Version 2.0.0** (February 1, 2026)
- Implemented comprehensive RBAC system
- Added 5 distinct user roles with specific duties
- Created Approval Center for Property Managers
- Built Tenant self-service dashboard
- Enhanced security features
- Added role permissions documentation
