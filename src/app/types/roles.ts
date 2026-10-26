// Core role definitions for the Real Estate Management System

export type UserRole = "property_manager" | "administrator" | "accountant" | "caretaker";

export interface UserPermissions {
  // Property Manager - Oversight & Approval
  approvePropertyListings: boolean;
  approveAdvertisements: boolean;
  approveTenantAllocation: boolean;
  approveLeaseTerms: boolean;
  approveTenantAccounts: boolean;
  approveMaintenanceBudgets: boolean;
  viewFinancialSummaries: boolean;
  suspendTerminateAccounts: boolean;
  resolveEscalations: boolean;
  
  // Administrator - Account Creation & Records
  createTenantAccounts: boolean;
  createLandlordAccounts: boolean;
  generateCredentials: boolean;
  uploadDocuments: boolean;
  createPropertyListings: boolean;
  linkTenantsToUnits: boolean;
  sendNotices: boolean;
  logComplaints: boolean;
  scheduleInspections: boolean;
  activateTenantAccounts: boolean;
  
  // Accountant - Financial Control
  recordPayments: boolean;
  generateInvoices: boolean;
  trackBalances: boolean;
  recordExpenses: boolean;
  prepareFinancialReports: boolean;
  manageBudgets: boolean;
  reconcileAccounts: boolean;
  flagIrregularities: boolean;
  
  // Caretaker - On-site Operations
  reportMaintenance: boolean;
  updateMaintenanceTasks: boolean;
  uploadInspectionMedia: boolean;
  conductInspections: boolean;
  recordUtilityReadings: boolean;
  reportIncidents: boolean;
  updateTaskStatus: boolean;
  
  // Common permissions
  viewDashboard: boolean;
  viewOwnProfile: boolean;
  changeOwnPassword: boolean;
}

export const defaultPermissionsByRole: Record<UserRole, UserPermissions> = {
  property_manager: {
    // Approval & oversight duties
    approvePropertyListings: true,
    approveAdvertisements: true,
    approveTenantAllocation: true,
    approveLeaseTerms: true,
    approveTenantAccounts: true,
    approveMaintenanceBudgets: true,
    viewFinancialSummaries: true,
    suspendTerminateAccounts: true,
    resolveEscalations: true,
    
    // NO direct data entry
    createTenantAccounts: false,
    createLandlordAccounts: false,
    generateCredentials: false,
    uploadDocuments: false,
    createPropertyListings: false,
    linkTenantsToUnits: false,
    sendNotices: false,
    logComplaints: false,
    scheduleInspections: false,
    activateTenantAccounts: false,
    
    // Read-only financial access
    recordPayments: false,
    generateInvoices: false,
    trackBalances: true, // View only
    recordExpenses: false,
    prepareFinancialReports: false,
    manageBudgets: false,
    reconcileAccounts: false,
    flagIrregularities: false,
    
    // No caretaker duties
    reportMaintenance: false,
    updateMaintenanceTasks: false,
    uploadInspectionMedia: false,
    conductInspections: false,
    recordUtilityReadings: false,
    reportIncidents: false,
    updateTaskStatus: false,
    
    // Common
    viewDashboard: true,
    viewOwnProfile: true,
    changeOwnPassword: true,
  },
  
  administrator: {
    // NO approval rights
    approvePropertyListings: false,
    approveAdvertisements: false,
    approveTenantAllocation: false,
    approveLeaseTerms: false,
    approveTenantAccounts: false,
    approveMaintenanceBudgets: false,
    viewFinancialSummaries: false, // Read-only operations
    suspendTerminateAccounts: false,
    resolveEscalations: false,
    
    // Full account & record management
    createTenantAccounts: true,
    createLandlordAccounts: true,
    generateCredentials: true,
    uploadDocuments: true,
    createPropertyListings: true,
    linkTenantsToUnits: true,
    sendNotices: true,
    logComplaints: true,
    scheduleInspections: true,
    activateTenantAccounts: true,
    
    // NO financial control
    recordPayments: false,
    generateInvoices: false,
    trackBalances: false,
    recordExpenses: false,
    prepareFinancialReports: false,
    manageBudgets: false,
    reconcileAccounts: false,
    flagIrregularities: false,
    
    // No caretaker duties
    reportMaintenance: false,
    updateMaintenanceTasks: false,
    uploadInspectionMedia: false,
    conductInspections: false,
    recordUtilityReadings: false,
    reportIncidents: false,
    updateTaskStatus: false,
    
    // Common
    viewDashboard: true,
    viewOwnProfile: true,
    changeOwnPassword: true,
  },
  
  accountant: {
    // NO approval rights
    approvePropertyListings: false,
    approveAdvertisements: false,
    approveTenantAllocation: false,
    approveLeaseTerms: false,
    approveTenantAccounts: false,
    approveMaintenanceBudgets: false,
    viewFinancialSummaries: true,
    suspendTerminateAccounts: false,
    resolveEscalations: false,
    
    // NO account creation
    createTenantAccounts: false,
    createLandlordAccounts: false,
    generateCredentials: false,
    uploadDocuments: false,
    createPropertyListings: false,
    linkTenantsToUnits: false,
    sendNotices: false,
    logComplaints: false,
    scheduleInspections: false,
    activateTenantAccounts: false,
    
    // Full financial control
    recordPayments: true,
    generateInvoices: true,
    trackBalances: true,
    recordExpenses: true,
    prepareFinancialReports: true,
    manageBudgets: true,
    reconcileAccounts: true,
    flagIrregularities: true,
    
    // No caretaker duties
    reportMaintenance: false,
    updateMaintenanceTasks: false,
    uploadInspectionMedia: false,
    conductInspections: false,
    recordUtilityReadings: false,
    reportIncidents: false,
    updateTaskStatus: false,
    
    // Common
    viewDashboard: true,
    viewOwnProfile: true,
    changeOwnPassword: true,
  },
  
  caretaker: {
    // NO approval rights
    approvePropertyListings: false,
    approveAdvertisements: false,
    approveTenantAllocation: false,
    approveLeaseTerms: false,
    approveTenantAccounts: false,
    approveMaintenanceBudgets: false,
    viewFinancialSummaries: false,
    suspendTerminateAccounts: false,
    resolveEscalations: false,
    
    // NO account creation
    createTenantAccounts: false,
    createLandlordAccounts: false,
    generateCredentials: false,
    uploadDocuments: false,
    createPropertyListings: false,
    linkTenantsToUnits: false,
    sendNotices: false,
    logComplaints: false,
    scheduleInspections: false,
    activateTenantAccounts: false,
    
    // NO financial access
    recordPayments: false,
    generateInvoices: false,
    trackBalances: false,
    recordExpenses: false,
    prepareFinancialReports: false,
    manageBudgets: false,
    reconcileAccounts: false,
    flagIrregularities: false,
    
    // Full on-site operation duties
    reportMaintenance: true,
    updateMaintenanceTasks: true,
    uploadInspectionMedia: true,
    conductInspections: true,
    recordUtilityReadings: true,
    reportIncidents: true,
    updateTaskStatus: true,
    
    // Common
    viewDashboard: true,
    viewOwnProfile: true,
    changeOwnPassword: true,
  },
};

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive" | "pending" | "suspended";
  createdDate: string;
  lastLogin?: string;
  password: string;
  tempPassword: boolean;
  permissions: UserPermissions;
  assignedProperties?: string[]; // Property IDs for caretakers
  createdBy?: string; // Administrator who created this account
}

// Display names for roles
export const roleDisplayNames: Record<UserRole, string> = {
  property_manager: "Property Manager",
  administrator: "Administrator",
  accountant: "Accountant",
  caretaker: "Caretaker",
};

// Role descriptions
export const roleDescriptions: Record<UserRole, string> = {
  property_manager: "Oversight, approval & control - Full operational access (no direct data entry)",
  administrator: "Account creation, records & coordination - Create & manage records (no financial approvals)",
  accountant: "Financial control & compliance - Finance-only access (read-only on operations)",
  caretaker: "On-site operations & reporting - Limited task-based access",
};
