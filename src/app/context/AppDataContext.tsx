import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  clearSession,
  getStoredUser,
  getToken,
  setSession,
} from "../api/client";
import {
  activitiesApi,
  apartmentsApi,
  authApi,
  paymentsApi,
  tenantsApi,
  unitsApi,
  usersApi,
} from "../api/services";
import type { Apartment } from "../components/ApartmentCard";
import type { Tenant } from "../components/TenantsPage";
import type { Unit } from "../components/UnitsPage";
import type { Payment } from "../components/PaymentHistoryPage";
import type { ActivityLog } from "../components/ActivityLogPage";
import type { UserRole } from "../components/UserManagementPage";
import { defaultPermissionsByRole } from "../components/UserManagementPage";

type AppDataContextValue = {
  isLoggedIn: boolean;
  loading: boolean;
  currentUser: UserRole | null;
  apartments: Apartment[];
  tenants: Tenant[];
  units: Unit[];
  payments: Payment[];
  activityLogs: ActivityLog[];
  users: UserRole[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAll: () => Promise<void>;
  updateProfile: (data: Partial<UserRole>) => Promise<UserRole>;
  setApartments: (next: Apartment[] | ((prev: Apartment[]) => Apartment[])) => void;
  setTenants: (next: Tenant[] | ((prev: Tenant[]) => Tenant[])) => void;
  setUnits: (next: Unit[] | ((prev: Unit[]) => Unit[])) => void;
  setPayments: (next: Payment[] | ((prev: Payment[]) => Payment[])) => void;
  setActivityLogs: (next: ActivityLog[] | ((prev: ActivityLog[]) => ActivityLog[])) => void;
  setUsers: (next: UserRole[] | ((prev: UserRole[]) => UserRole[])) => void;
  // Persisting helpers
  saveApartment: (data: Partial<Apartment> & { name: string }, id?: string) => Promise<Apartment>;
  deleteApartment: (id: string) => Promise<void>;
  saveTenant: (
    data: Partial<Tenant> & { apartmentId: string; name: string; email: string; unit: string; rentAmount: number; joiningDate: string },
    id?: string
  ) => Promise<Tenant>;
  deleteTenant: (id: string) => Promise<void>;
  saveUnit: (data: Partial<Unit> & { apartmentId: string }, id?: string) => Promise<Unit>;
  deleteUnit: (id: string) => Promise<void>;
  savePayment: (
    data: Partial<Payment> & { tenantId: string; amount: number; date: string }
  ) => Promise<Payment>;
  saveUser: (data: Partial<UserRole> & { password?: string }, id?: string) => Promise<UserRole>;
  deleteUser: (id: string) => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

function resolveNext<T>(next: T | ((prev: T) => T), prev: T): T {
  return typeof next === "function" ? (next as (p: T) => T)(prev) : next;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserRole | null>(null);
  const [apartments, setApartmentsState] = useState<Apartment[]>([]);
  const [tenants, setTenantsState] = useState<Tenant[]>([]);
  const [units, setUnitsState] = useState<Unit[]>([]);
  const [payments, setPaymentsState] = useState<Payment[]>([]);
  const [activityLogs, setActivityLogsState] = useState<ActivityLog[]>([]);
  const [users, setUsersState] = useState<UserRole[]>([]);

  const refreshAll = useCallback(async () => {
    const [a, t, u, p, logs, us] = await Promise.all([
      apartmentsApi.list(),
      tenantsApi.list(),
      unitsApi.list(),
      paymentsApi.list(),
      activitiesApi.list(),
      usersApi.list().catch(() => [] as UserRole[]),
    ]);
    setApartmentsState(a);
    setTenantsState(t);
    setUnitsState(u);
    setPaymentsState(p);
    setActivityLogsState(logs);
    setUsersState(us);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      const token = getToken();
      const stored = getStoredUser<UserRole>();
      if (!token || !stored) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await authApi.me();
        setCurrentUser({
          ...user,
          permissions: user.permissions || defaultPermissionsByRole[user.role],
        });
        setIsLoggedIn(true);
        await refreshAll();
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, [refreshAll]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token, user } = await authApi.login(email, password);
      const normalized = {
        ...user,
        permissions: user.permissions || defaultPermissionsByRole[user.role],
      };
      setSession(token, normalized);
      setCurrentUser(normalized);
      setIsLoggedIn(true);
      await refreshAll();
      toast.success(`Welcome back, ${normalized.name}!`, {
        description: `Logged in as ${normalized.role}`,
      });
    },
    [refreshAll]
  );

  const logout = useCallback(() => {
    clearSession();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setApartmentsState([]);
    setTenantsState([]);
    setUnitsState([]);
    setPaymentsState([]);
    setActivityLogsState([]);
    setUsersState([]);
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserRole>) => {
    const { user } = await authApi.updateProfile(data);
    const normalized = {
      ...user,
      permissions: user.permissions || defaultPermissionsByRole[user.role],
    };
    const token = getToken();
    if (token) setSession(token, normalized);
    setCurrentUser(normalized);
    setUsersState((prev) =>
      prev.map((u) => (u.id === normalized.id ? { ...u, ...normalized } : u))
    );
    return normalized;
  }, []);

  const saveApartment = useCallback(
    async (data: Partial<Apartment> & { name: string }, id?: string) => {
      const saved = id
        ? await apartmentsApi.update(id, data)
        : await apartmentsApi.create(data);
      await refreshAll();
      return saved;
    },
    [refreshAll]
  );

  const deleteApartment = useCallback(
    async (id: string) => {
      await apartmentsApi.remove(id);
      await refreshAll();
    },
    [refreshAll]
  );

  const saveTenant = useCallback(
    async (
      data: Partial<Tenant> & {
        apartmentId: string;
        name: string;
        email: string;
        unit: string;
        rentAmount: number;
        joiningDate: string;
      },
      id?: string
    ) => {
      const saved = id ? await tenantsApi.update(id, data) : await tenantsApi.create(data);
      await refreshAll();
      return saved;
    },
    [refreshAll]
  );

  const deleteTenant = useCallback(
    async (id: string) => {
      await tenantsApi.remove(id);
      await refreshAll();
    },
    [refreshAll]
  );

  const saveUnit = useCallback(
    async (data: Partial<Unit> & { apartmentId: string }, id?: string) => {
      const saved = id ? await unitsApi.update(id, data) : await unitsApi.create(data);
      await refreshAll();
      return saved;
    },
    [refreshAll]
  );

  const deleteUnit = useCallback(
    async (id: string) => {
      await unitsApi.remove(id);
      await refreshAll();
    },
    [refreshAll]
  );

  const savePayment = useCallback(
    async (data: Partial<Payment> & { tenantId: string; amount: number; date: string }) => {
      const saved = await paymentsApi.create(data);
      await refreshAll();
      return saved;
    },
    [refreshAll]
  );

  const saveUser = useCallback(
    async (data: Partial<UserRole> & { password?: string }, id?: string) => {
      const saved = id
        ? await usersApi.update(id, data)
        : await usersApi.create(data as Partial<UserRole> & { password: string });
      await refreshAll();
      return saved;
    },
    [refreshAll]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      await usersApi.remove(id);
      await refreshAll();
    },
    [refreshAll]
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      isLoggedIn,
      loading,
      currentUser,
      apartments,
      tenants,
      units,
      payments,
      activityLogs,
      users,
      login,
      logout,
      refreshAll,
      updateProfile,
      setApartments: (next) => setApartmentsState((prev) => resolveNext(next, prev)),
      setTenants: (next) => setTenantsState((prev) => resolveNext(next, prev)),
      setUnits: (next) => setUnitsState((prev) => resolveNext(next, prev)),
      setPayments: (next) => setPaymentsState((prev) => resolveNext(next, prev)),
      setActivityLogs: (next) => setActivityLogsState((prev) => resolveNext(next, prev)),
      setUsers: (next) => setUsersState((prev) => resolveNext(next, prev)),
      saveApartment,
      deleteApartment,
      saveTenant,
      deleteTenant,
      saveUnit,
      deleteUnit,
      savePayment,
      saveUser,
      deleteUser,
    }),
    [
      isLoggedIn,
      loading,
      currentUser,
      apartments,
      tenants,
      units,
      payments,
      activityLogs,
      users,
      login,
      logout,
      refreshAll,
      updateProfile,
      saveApartment,
      deleteApartment,
      saveTenant,
      deleteTenant,
      saveUnit,
      deleteUnit,
      savePayment,
      saveUser,
      deleteUser,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
