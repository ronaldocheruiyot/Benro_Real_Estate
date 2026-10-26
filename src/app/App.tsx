import { useState } from "react";
import { LoginForm } from "./components/LoginForm";
import { BrandLogo } from "./components/BrandLogo";
import { ApartmentDashboard } from "./components/ApartmentDashboard";
import { ProfilePage } from "./components/ProfilePage";
import { SettingsPage } from "./components/SettingsPage";
import { HelpSupportPage } from "./components/HelpSupportPage";
import { TenantsPage } from "./components/TenantsPage";
import { ActiveTenantsPage } from "./components/ActiveTenantsPage";
import { FailedToPayPage } from "./components/FailedToPayPage";
import { TenantsLeftPage } from "./components/TenantsLeftPage";
import { VacantUnitsPage } from "./components/VacantUnitsPage";
import { PaymentHistoryPage } from "./components/PaymentHistoryPage";
import { ActivityLogPage } from "./components/ActivityLogPage";
import { UnitsPage } from "./components/UnitsPage";
import { FinancialReportsPage } from "./components/FinancialReportsPage";
import { UserManagementPage } from "./components/UserManagementPage";
import { AdvertisementPage } from "./components/AdvertisementPage";
import { HousesManagementPage } from "./components/HousesManagementPage";
import { TenantsByApartmentPage } from "./components/TenantsByApartmentPage";
import { CaretakerDashboardPage } from "./components/CaretakerDashboardPage";
import { LandManagementPage } from "./components/LandManagementPage";
import { Toaster } from "./components/ui/sonner";
import { Apartment } from "./components/ApartmentCard";
import { AppDataProvider, useAppData } from "./context/AppDataContext";
import { toast } from "sonner";

type View =
  | "dashboard"
  | "profile"
  | "settings"
  | "help"
  | "tenants"
  | "activeTenants"
  | "failedToPay"
  | "tenantsLeft"
  | "vacantUnits"
  | "paymentHistory"
  | "activityLog"
  | "units"
  | "financialReports"
  | "userManagement"
  | "advertisements"
  | "houses"
  | "tenantsByApartment"
  | "landManagement";

function AppShell() {
  const {
    isLoggedIn,
    loading,
    currentUser,
    apartments,
    tenants,
    units,
    payments,
    activityLogs,
    users,
    logout,
    refreshAll,
    saveApartment,
    deleteApartment,
    saveTenant,
    saveUnit,
    deleteUnit,
    savePayment,
    saveUser,
    deleteUser,
    setTenants,
    setPayments,
    setActivityLogs,
    setUsers,
  } = useAppData();

  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);

  const handleLogout = () => {
    logout();
    setCurrentView("dashboard");
    setSelectedApartment(null);
  };

  const handleViewTenants = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setCurrentView("tenants");
  };

  const handleNavigateToSubPage = (view: View) => {
    setCurrentView(view);
  };

  const handleApartmentsChange = async (newApartments: Apartment[]) => {
    try {
      const removed = apartments.filter((a) => !newApartments.find((n) => n.id === a.id));
      const added = newApartments.filter(
        (n) => !apartments.find((a) => a.id === n.id) || String(n.id).length < 8
      );
      const updated = newApartments.filter((n) => {
        const prev = apartments.find((a) => a.id === n.id);
        return prev && JSON.stringify(prev) !== JSON.stringify(n);
      });

      for (const apt of removed) {
        await deleteApartment(apt.id);
      }
      for (const apt of added) {
        if (apartments.find((a) => a.id === apt.id)) continue;
        // local-only ids from old UI (timestamp) — create on server
        if (!apartments.some((a) => a.id === apt.id)) {
          const { id: _id, ...rest } = apt;
          await saveApartment(rest as Apartment);
        }
      }
      for (const apt of updated) {
        if (removed.some((r) => r.id === apt.id)) continue;
        if (!apartments.some((a) => a.id === apt.id)) continue;
        const { id, ...rest } = apt;
        await saveApartment({ ...rest, name: apt.name }, id);
      }
      // Fallback: if only length grew with fake id, create last
      if (newApartments.length > apartments.length) {
        const maybeNew = newApartments[newApartments.length - 1];
        if (!apartments.find((a) => a.id === maybeNew.id)) {
          // already handled in added loop via refresh
        }
      }
      await refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to sync apartments");
      await refreshAll();
    }
  };

  const handleConfigureUnits = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setCurrentView("units");
  };

  const vacantUnits = units
    .filter((u) => u.status === "vacant" && (!selectedApartment || (u as any).apartmentId === selectedApartment.id))
    .map((u) => u.unitNumber);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cyan-soft/40">
        <div className="rounded-2xl border bg-white px-8 py-6 shadow-lg text-brand-navy">
          Connecting to BENRO database…
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  if (isLoggedIn && currentUser) {
    if (currentUser.role === "caretaker") {
      if (currentView === "dashboard") {
        return (
          <>
            <CaretakerDashboardPage
              onLogout={handleLogout}
              onNavigate={setCurrentView}
              currentUser={currentUser}
            />
            <Toaster position="top-right" />
          </>
        );
      }
      if (currentView === "profile") {
        return (
          <>
            <ProfilePage onLogout={handleLogout} onNavigate={setCurrentView} currentUser={currentUser} />
            <Toaster position="top-right" />
          </>
        );
      }
      if (currentView === "settings") {
        return (
          <>
            <SettingsPage onLogout={handleLogout} onNavigate={setCurrentView} currentUser={currentUser} />
            <Toaster position="top-right" />
          </>
        );
      }
      if (currentView === "help") {
        return (
          <>
            <HelpSupportPage onLogout={handleLogout} onNavigate={setCurrentView} currentUser={currentUser} />
            <Toaster position="top-right" />
          </>
        );
      }
      return (
        <>
          <CaretakerDashboardPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            currentUser={currentUser}
          />
          <Toaster position="top-right" />
        </>
      );
    }

    const apartmentUnits = selectedApartment
      ? units.filter((u: any) => u.apartmentId === selectedApartment.id)
      : units;
    const apartmentTenants = selectedApartment
      ? tenants.filter((t: any) => t.apartmentId === selectedApartment.id)
      : tenants;
    const apartmentPayments = selectedApartment
      ? payments.filter((p: any) => p.apartmentId === selectedApartment.id)
      : payments;
    const apartmentLogs = selectedApartment
      ? activityLogs.filter((l: any) => !l.apartmentId || l.apartmentId === selectedApartment.id)
      : activityLogs;

    return (
      <>
        {currentView === "dashboard" && (
          <ApartmentDashboard
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            onViewTenants={handleViewTenants}
            apartments={apartments}
            onApartmentsChange={handleApartmentsChange}
            onPersistApartment={async (data, id) => {
              await saveApartment(data, id);
              toast.success(id ? "Apartment updated" : "Apartment added");
            }}
            onPersistDeleteApartment={async (id) => {
              await deleteApartment(id);
              toast.success("Apartment deleted");
            }}
            currentUser={currentUser}
          />
        )}
        {currentView === "profile" && (
          <ProfilePage onLogout={handleLogout} onNavigate={setCurrentView} currentUser={currentUser} />
        )}
        {currentView === "settings" && (
          <SettingsPage onLogout={handleLogout} onNavigate={setCurrentView} currentUser={currentUser} />
        )}
        {currentView === "help" && (
          <HelpSupportPage onLogout={handleLogout} onNavigate={setCurrentView} currentUser={currentUser} />
        )}
        {currentView === "tenants" && (
          <TenantsPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            apartment={selectedApartment || undefined}
            onBack={() => setCurrentView("dashboard")}
            tenants={apartmentTenants}
            setTenants={async (next) => {
              const list = typeof next === "function" ? next(apartmentTenants) : next;
              // detect adds
              for (const t of list) {
                const exists = tenants.find((x) => x.id === t.id);
                if (!exists && selectedApartment) {
                  const { id: _id, ...rest } = t as any;
                  await saveTenant({ ...rest, apartmentId: selectedApartment.id });
                } else if (exists && JSON.stringify(exists) !== JSON.stringify(t)) {
                  await saveTenant(
                    { ...(t as any), apartmentId: (t as any).apartmentId || selectedApartment?.id },
                    t.id
                  );
                }
              }
              for (const old of apartmentTenants) {
                if (!list.find((t) => t.id === old.id)) {
                  // deleted locally — ignore unless explicit delete API used
                }
              }
              await refreshAll();
            }}
            vacantUnits={vacantUnits}
            setVacantUnits={() => {}}
            onNavigateToSubPage={handleNavigateToSubPage}
          />
        )}
        {currentView === "activeTenants" && selectedApartment && (
          <ActiveTenantsPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            apartment={selectedApartment}
            onBack={() => setCurrentView("tenants")}
            tenants={apartmentTenants}
            setTenants={async (next) => {
              const list = typeof next === "function" ? next(apartmentTenants) : next;
              for (const t of list) {
                const exists = tenants.find((x) => x.id === t.id);
                if (exists && JSON.stringify(exists) !== JSON.stringify(t)) {
                  await saveTenant(
                    { ...(t as any), apartmentId: selectedApartment.id },
                    t.id
                  );
                }
              }
              await refreshAll();
            }}
            payments={apartmentPayments}
            setPayments={async (next) => {
              const list = typeof next === "function" ? next(apartmentPayments) : next;
              for (const p of list) {
                if (!payments.find((x) => x.id === p.id)) {
                  await savePayment({
                    ...(p as any),
                    apartmentId: selectedApartment.id,
                    tenantId: p.tenantId,
                    amount: p.amount,
                    date: p.date,
                  });
                }
              }
              await refreshAll();
            }}
            activityLogs={apartmentLogs}
            setActivityLogs={setActivityLogs}
            currentUser={currentUser}
          />
        )}
        {currentView === "failedToPay" && selectedApartment && (
          <FailedToPayPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            apartment={selectedApartment}
            onBack={() => setCurrentView("tenants")}
            tenants={apartmentTenants}
            setTenants={async (next) => {
              const list = typeof next === "function" ? next(apartmentTenants) : next;
              for (const t of list) {
                const exists = tenants.find((x) => x.id === t.id);
                if (exists && JSON.stringify(exists) !== JSON.stringify(t)) {
                  await saveTenant({ ...(t as any), apartmentId: selectedApartment.id }, t.id);
                }
              }
              await refreshAll();
            }}
          />
        )}
        {currentView === "tenantsLeft" && selectedApartment && (
          <TenantsLeftPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            apartment={selectedApartment}
            onBack={() => setCurrentView("tenants")}
            tenants={apartmentTenants}
            setTenants={async (next) => {
              const list = typeof next === "function" ? next(apartmentTenants) : next;
              for (const t of list) {
                const exists = tenants.find((x) => x.id === t.id);
                if (exists && JSON.stringify(exists) !== JSON.stringify(t)) {
                  await saveTenant({ ...(t as any), apartmentId: selectedApartment.id }, t.id);
                }
              }
              await refreshAll();
            }}
          />
        )}
        {currentView === "vacantUnits" && selectedApartment && (
          <VacantUnitsPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            apartment={selectedApartment}
            onBack={() => setCurrentView("tenants")}
            vacantUnits={vacantUnits}
            setVacantUnits={() => {}}
            units={apartmentUnits}
            onAddUnit={async (unit) => {
              await saveUnit({ ...unit, apartmentId: selectedApartment.id } as any);
              toast.success("Vacant unit added");
            }}
          />
        )}
        {currentView === "paymentHistory" && selectedApartment && (
          <PaymentHistoryPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            apartment={selectedApartment}
            onBack={() => setCurrentView("tenants")}
            tenants={apartmentTenants}
            payments={apartmentPayments}
            setPayments={async (next) => {
              const list = typeof next === "function" ? next(apartmentPayments) : next;
              for (const p of list) {
                if (!payments.find((x) => x.id === p.id)) {
                  await savePayment({
                    ...(p as any),
                    apartmentId: selectedApartment.id,
                    tenantId: p.tenantId,
                    amount: p.amount,
                    date: p.date,
                  });
                }
              }
              await refreshAll();
            }}
          />
        )}
        {currentView === "activityLog" && selectedApartment && (
          <ActivityLogPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            apartment={selectedApartment}
            onBack={() => setCurrentView("tenants")}
            activityLogs={apartmentLogs}
          />
        )}
        {currentView === "units" && selectedApartment && (
          <UnitsPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            apartment={selectedApartment}
            onBack={() => setCurrentView("houses")}
            units={apartmentUnits}
            setUnits={async (next) => {
              const list = typeof next === "function" ? next(apartmentUnits) : next;
              for (const u of list) {
                const exists = units.find((x) => x.id === u.id);
                if (!exists) {
                  const { id: _id, ...rest } = u as any;
                  await saveUnit({ ...rest, apartmentId: selectedApartment.id });
                } else if (JSON.stringify(exists) !== JSON.stringify(u)) {
                  await saveUnit({ ...(u as any), apartmentId: selectedApartment.id }, u.id);
                }
              }
              for (const old of apartmentUnits) {
                if (!list.find((u) => u.id === old.id)) {
                  await deleteUnit(old.id);
                }
              }
              await refreshAll();
            }}
            tenants={apartmentTenants}
            currentUser={currentUser}
          />
        )}
        {currentView === "financialReports" && (
          <FinancialReportsPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            onBack={() => setCurrentView("profile")}
            apartments={apartments}
            payments={payments}
            currentUser={currentUser}
          />
        )}
        {currentView === "userManagement" && (
          <UserManagementPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            apartments={apartments}
            currentUser={currentUser}
            users={users}
            onUpdateUsers={async (next) => {
              const list = typeof next === "function" ? next(users) : next;
              for (const u of list) {
                const exists = users.find((x) => x.id === u.id);
                if (!exists) {
                  const { id: _id, ...rest } = u as any;
                  await saveUser(rest);
                } else if (JSON.stringify(exists) !== JSON.stringify(u)) {
                  await saveUser(u, u.id);
                }
              }
              for (const old of users) {
                if (!list.find((u) => u.id === old.id)) {
                  await deleteUser(old.id);
                }
              }
              await refreshAll();
            }}
          />
        )}
        {currentView === "advertisements" && (
          <AdvertisementPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            currentUser={currentUser}
          />
        )}
        {currentView === "houses" && (
          <HousesManagementPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            apartments={apartments}
            onApartmentsChange={handleApartmentsChange}
            onPersistApartment={async (data, id) => {
              await saveApartment(data, id);
              toast.success(id ? "House updated" : "House added");
            }}
            onPersistDeleteApartment={async (id) => {
              await deleteApartment(id);
              toast.success("House deleted");
            }}
            onConfigureUnits={handleConfigureUnits}
            currentUser={currentUser}
          />
        )}
        {currentView === "tenantsByApartment" && (
          <TenantsByApartmentPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            onBack={() => setCurrentView("tenants")}
            apartments={apartments}
            tenants={tenants}
            setTenants={setTenants}
            payments={payments}
            setPayments={setPayments}
            activityLogs={activityLogs}
            setActivityLogs={setActivityLogs}
            currentUser={currentUser}
          />
        )}
        {currentView === "landManagement" && (
          <LandManagementPage
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            currentUser={currentUser}
          />
        )}
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      <div className="flex size-full min-h-screen">
        <div className="relative hidden items-center justify-center overflow-hidden bg-brand-navy-deep lg:flex lg:w-[52%]">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-deep via-brand-navy to-cyan-950" />
          <div className="absolute -left-32 -top-32 size-96 rounded-full bg-brand-cyan/20 blur-3xl" />
          <div className="absolute -bottom-44 -right-24 size-96 rounded-full bg-brand-lime/10 blur-3xl" />
          <div className="brand-grid absolute inset-0 opacity-20" />
          <div className="absolute left-10 top-10 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-cyan-50/60">
            <span className="size-2 rounded-full bg-brand-lime shadow-lg shadow-brand-lime/40" />
            BENRO Workspace
          </div>
          <BrandLogo />
          <p className="absolute bottom-8 text-xs text-cyan-50/40">
            Secure real estate operations in one place
          </p>
        </div>

        <div className="relative flex w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-brand-cyan-soft/50 p-5 sm:p-8 lg:w-[48%]">
          <div className="absolute right-0 top-0 size-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-cyan/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 size-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-brand-lime/20 blur-3xl" />
          <LoginForm />
        </div>
      </div>
      <Toaster position="top-right" />
    </>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <AppShell />
    </AppDataProvider>
  );
}
