import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Crown, 
  Shield, 
  Calculator, 
  Wrench, 
  User,
  CheckCircle,
  XCircle
} from "lucide-react";

export function RolePermissionsGuide() {
  const roles = [
    {
      id: "propertyManager",
      name: "Property Manager",
      icon: Crown,
      color: "purple",
      description: "Oversight, approval & control",
      accessLevel: "Full operational access (no direct data entry)",
      duties: [
        "Approve landlord onboarding and property listings",
        "Approve house advertisements and rental pricing",
        "Approve tenant allocation to units",
        "Approve and authorize lease terms",
        "Approve tenant account activation",
        "Approve maintenance budgets and major repairs",
        "Review financial summaries and performance reports",
        "Resolve escalated tenant, landlord, and staff issues",
        "Suspend or terminate tenant accounts when necessary"
      ],
      cannotDo: [
        "Cannot create accounts directly",
        "Cannot enter financial data",
        "Cannot perform day-to-day operations"
      ]
    },
    {
      id: "administrator",
      name: "Administrator",
      icon: Shield,
      color: "blue",
      description: "Account creation, records & coordination",
      accessLevel: "Create & manage records (no financial approvals)",
      duties: [
        "Create tenant user accounts in the system",
        "Generate and issue temporary login credentials",
        "Create and manage landlord accounts",
        "Capture and upload leases, ownership documents, permits, tenant IDs",
        "Create, publish, and update property listings",
        "Link tenants to properties, units, and leases",
        "Send system notices (rent reminders, notices to vacate)",
        "Log complaints and maintenance requests",
        "Schedule inspections and viewings",
        "Activate tenant accounts after approval"
      ],
      cannotDo: [
        "Cannot approve major decisions",
        "Cannot access financial operations",
        "Cannot delete critical data"
      ]
    },
    {
      id: "accountant",
      name: "Accountant",
      icon: Calculator,
      color: "orange",
      description: "Financial control & compliance",
      accessLevel: "Finance-only access (read-only on operations)",
      duties: [
        "Record rent payments, deposits, and penalties",
        "Generate invoices and receipts",
        "Track tenant balances and arrears",
        "Record maintenance and operational expenses",
        "Prepare financial reports (monthly, annual)",
        "Confirm financial compliance before tenant activation",
        "Manage budgets and expense categories",
        "Reconcile bank and cash accounts",
        "Flag financial irregularities for management review"
      ],
      cannotDo: [
        "Cannot modify tenant or unit data",
        "Cannot create user accounts",
        "Cannot approve budgets"
      ]
    },
    {
      id: "caretaker",
      name: "Caretaker",
      icon: Wrench,
      color: "green",
      description: "On-site operations & reporting",
      accessLevel: "Limited task-based access (assigned properties only)",
      duties: [
        "Report maintenance issues through the system",
        "Receive and update assigned maintenance tasks",
        "Upload photos/videos of repairs, inspections, property condition",
        "Conduct move-in and move-out inspections",
        "Record utility meter readings",
        "Enforce house rules on-site",
        "Report incidents and emergencies",
        "Update task status (Pending → In Progress → Completed)"
      ],
      cannotDo: [
        "Cannot access financial data",
        "Cannot view other properties",
        "Cannot manage tenant accounts"
      ]
    },
    {
      id: "tenant",
      name: "Tenant",
      icon: User,
      color: "gray",
      description: "Self-service user",
      accessLevel: "Personal account only (no system management)",
      duties: [
        "Log in using credentials issued by Administrator",
        "Change password on first login (forced)",
        "View lease details and account balance",
        "View payment history",
        "Submit maintenance requests",
        "Submit complaints and notices to vacate",
        "Upload move-in and move-out photos",
        "Receive notices and receipts"
      ],
      cannotDo: [
        "Cannot access system management",
        "Cannot view other tenants' data",
        "Cannot modify property information"
      ]
    }
  ];

  const systemFeatures = [
    {
      category: "Security",
      features: [
        "Role-based access control (RBAC)",
        "Forced password change on first login",
        "Auto-generated secure passwords",
        "Account status management (Pending / Active / Suspended)",
        "Session management and timeout",
        "Audit logs for all actions"
      ]
    },
    {
      category: "Automation",
      features: [
        "Automated email notifications",
        "Automated rent reminders",
        "Automated password generation",
        "Automated receipt generation",
        "Task status tracking",
        "Data backup and integrity checks"
      ]
    },
    {
      category: "Workflow",
      features: [
        "Approval workflows for Property Manager",
        "Multi-step tenant onboarding",
        "Maintenance request tracking",
        "Document management system",
        "Financial reconciliation",
        "Escalation procedures"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Access Control System</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="propertyManager" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {roles.map((role) => (
                <TabsTrigger key={role.id} value={role.id} className="flex items-center gap-1">
                  <role.icon className="h-3 w-3" />
                  <span className="hidden lg:inline">{role.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {roles.map((role) => (
              <TabsContent key={role.id} value={role.id} className="mt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className={`p-6 bg-${role.color}-50 rounded-lg border-l-4 border-${role.color}-500`}>
                    <div className="flex items-start gap-4">
                      <role.icon className={`h-12 w-12 text-${role.color}-600`} />
                      <div className="flex-1">
                        <h3 className={`text-${role.color}-900 mb-2`}>{role.name}</h3>
                        <p className="text-neutral-700 mb-3">{role.description}</p>
                        <Badge className={`bg-${role.color}-100 text-${role.color}-700`}>
                          {role.accessLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Duties */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          System Duties
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {role.duties.map((duty, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                              <span>{duty}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          Restrictions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {role.cannotDo.map((restriction, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                              <span>{restriction}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* System Features */}
      <Card>
        <CardHeader>
          <CardTitle>System Control & Security Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {systemFeatures.map((category) => (
              <div key={category.category}>
                <h4 className="font-medium mb-3 text-neutral-900">{category.category}</h4>
                <ul className="space-y-2">
                  {category.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-neutral-600">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference: Who Can Do What?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Action</th>
                  <th className="text-center p-3 font-medium">Property Mgr</th>
                  <th className="text-center p-3 font-medium">Admin</th>
                  <th className="text-center p-3 font-medium">Accountant</th>
                  <th className="text-center p-3 font-medium">Caretaker</th>
                  <th className="text-center p-3 font-medium">Tenant</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">Create user accounts</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Approve tenant allocation</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Record payments</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Report maintenance</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">View financial reports</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Suspend accounts</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
