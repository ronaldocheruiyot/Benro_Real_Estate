import { useState } from "react";
import { ProfileDropdown } from "./ProfileDropdown";
import { NotificationDropdown } from "./NotificationDropdown";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import {
  Shield,
  User,
  Wrench,
  Calculator,
  LogOut,
  Menu,
  LayoutDashboard,
  Building2,
  Users,
  Megaphone,
  Map,
  UserCog,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { UserRole } from "./UserManagementPage";

interface NavigationProps {
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
  currentView?: string;
  currentUser?: UserRole;
}

const viewIcons: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  houses: Building2,
  tenants: Users,
  advertisements: Megaphone,
  landManagement: Map,
  userManagement: UserCog,
  payments: Receipt,
};

export function Navigation({ onLogout, onNavigate, currentView, currentUser }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const permissions = currentUser?.permissions;

  const navItems = [
    {
      label: "Dashboard",
      view: "dashboard",
      visible: true,
    },
    {
      label: "Houses",
      view: "houses",
      visible: permissions?.manageProperties !== false && currentUser?.role !== "caretaker",
    },
    {
      label: "Tenants Mgmt",
      view: "tenants",
      visible: permissions?.manageTenants !== false && currentUser?.role !== "caretaker",
    },
    {
      label: "Payments",
      view: "payments",
      visible:
        currentUser?.role !== "caretaker" &&
        (permissions?.managePayments !== false ||
          permissions?.viewReports !== false ||
          currentUser?.role === "admin" ||
          currentUser?.role === "accountant"),
    },
    {
      label: "Advertisements",
      view: "advertisements",
      visible: permissions?.viewReports !== false && currentUser?.role !== "caretaker",
    },
    {
      label: "Land Management",
      view: "landManagement",
      visible: currentUser?.role === "admin" || currentUser?.role === "manager",
    },
    {
      label: "User Management",
      view: "userManagement",
      visible: permissions?.manageUsers === true && currentUser?.role !== "caretaker",
    },
  ].filter((item) => item.visible);

  const getRoleInfo = (role?: string) => {
    switch (role) {
      case "admin":
        return { icon: Shield, color: "bg-brand-cyan text-brand-navy-deep", label: "Admin" };
      case "manager":
        return { icon: User, color: "bg-brand-lime text-brand-navy-deep", label: "Manager" };
      case "caretaker":
        return { icon: Wrench, color: "bg-white/15 text-white border border-white/30", label: "Caretaker" };
      case "accountant":
        return { icon: Calculator, color: "bg-brand-cyan-soft text-brand-navy", label: "Accountant" };
      default:
        return { icon: User, color: "bg-white/15 text-white", label: "User" };
    }
  };

  const roleInfo = getRoleInfo(currentUser?.role);
  const currentLabel = navItems.find((i) => i.view === currentView)?.label || "Menu";

  const goTo = (view: string) => {
    onNavigate?.(view);
    setMobileOpen(false);
  };

  return (
    <nav className="relative w-full overflow-hidden bg-brand-navy-deep text-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-navy-deep via-brand-navy to-cyan-950" />
      <div className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-brand-cyan/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-10 size-48 rounded-full bg-brand-lime/10 blur-3xl" />

      {/* Mobile bar */}
      <div className="relative flex items-center gap-2 px-3 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex size-10 items-center justify-center rounded-lg border border-white/15 bg-white/10"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{currentLabel}</p>
          {currentUser && (
            <p className="truncate text-xs text-cyan-50/70">{currentUser.name}</p>
          )}
        </div>

        {currentUser && (
          <Badge className={`${roleInfo.color} border-none shrink-0 font-medium`}>
            <roleInfo.icon className="mr-1 h-3 w-3" />
            {roleInfo.label}
          </Badge>
        )}

        <NotificationDropdown />
        <ProfileDropdown onLogout={onLogout} onNavigate={onNavigate} currentUser={currentUser} />
      </div>

      {/* Desktop bar */}
      <div className="relative hidden items-center px-6 py-4 md:flex">
        <div className="mr-8 flex items-center gap-3">
          <ProfileDropdown onLogout={onLogout} onNavigate={onNavigate} currentUser={currentUser} />
        </div>

        {currentUser && (
          <div className="mr-4">
            <Badge className={`${roleInfo.color} flex items-center gap-1 border-none font-medium`}>
              <roleInfo.icon className="h-3 w-3" />
              {roleInfo.label}
            </Badge>
          </div>
        )}

        <ul className="flex items-center gap-6">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => onNavigate?.(item.view)}
                className={`whitespace-nowrap border-b-2 pb-0.5 transition-colors ${
                  currentView === item.view
                    ? "border-brand-lime text-white"
                    : "border-transparent text-cyan-50/80 hover:border-brand-cyan/60 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-4">
          {currentUser && (
            <span className="hidden text-sm text-cyan-50/80 lg:inline">{currentUser.name}</span>
          )}
          <NotificationDropdown />
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 transition-colors hover:border-brand-cyan/40 hover:bg-brand-cyan/20 md:px-4"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden text-sm font-medium md:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile menu sheet — tap pages instead of horizontal drag */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[min(100%,20rem)] border-r-0 bg-brand-navy-deep p-0 text-white"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy-deep via-brand-navy to-cyan-950" />
          <div className="relative flex h-full flex-col">
            <SheetHeader className="border-b border-white/10 px-5 py-5 text-left">
              <SheetTitle className="text-white">BENRO Menu</SheetTitle>
              <SheetDescription className="text-cyan-50/70">
                Tap a page to open it
              </SheetDescription>
              {currentUser && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge className={`${roleInfo.color} border-none font-medium`}>
                    <roleInfo.icon className="mr-1 h-3 w-3" />
                    {roleInfo.label}
                  </Badge>
                  <span className="truncate text-sm text-cyan-50/80">{currentUser.name}</span>
                </div>
              )}
            </SheetHeader>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = viewIcons[item.view] || LayoutDashboard;
                  const active = currentView === item.view;
                  return (
                    <li key={item.view}>
                      <button
                        type="button"
                        onClick={() => goTo(item.view)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                          active
                            ? "bg-brand-cyan/20 text-white ring-1 ring-brand-lime/50"
                            : "text-cyan-50/85 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span
                          className={`flex size-9 items-center justify-center rounded-lg ${
                            active ? "bg-brand-lime text-brand-navy-deep" : "bg-white/10"
                          }`}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="flex-1 font-medium">{item.label}</span>
                        <ChevronRight className="size-4 opacity-50" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-white/10 p-4">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onLogout?.();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-medium hover:bg-brand-cyan/20"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
