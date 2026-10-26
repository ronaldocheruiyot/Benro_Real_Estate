import { api } from "./client";
import type { UserRole } from "../components/UserManagementPage";
import type { Apartment } from "../components/ApartmentCard";
import type { Tenant } from "../components/TenantsPage";
import type { Unit } from "../components/UnitsPage";
import type { Payment } from "../components/PaymentHistoryPage";
import type { ActivityLog } from "../components/ActivityLogPage";

export type LoginResponse = { token: string; user: UserRole };

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { email, password }),
  me: () => api.get<{ user: UserRole }>("/auth/me"),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post("/auth/change-password", { currentPassword, newPassword }),
};

export const apartmentsApi = {
  list: () => api.get<Apartment[]>("/apartments"),
  create: (data: Partial<Apartment>) => api.post<Apartment>("/apartments", data),
  update: (id: string, data: Partial<Apartment>) => api.put<Apartment>(`/apartments/${id}`, data),
  remove: (id: string) => api.delete(`/apartments/${id}`),
};

export const unitsApi = {
  list: (apartmentId?: string) =>
    api.get<Unit[]>(apartmentId ? `/units?apartmentId=${apartmentId}` : "/units"),
  create: (data: Partial<Unit> & { apartmentId: string }) => api.post<Unit>("/units", data),
  update: (id: string, data: Partial<Unit>) => api.put<Unit>(`/units/${id}`, data),
  remove: (id: string) => api.delete(`/units/${id}`),
};

export const tenantsApi = {
  list: (apartmentId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (apartmentId) params.set("apartmentId", apartmentId);
    if (status) params.set("status", status);
    const q = params.toString();
    return api.get<Tenant[]>(`/tenants${q ? `?${q}` : ""}`);
  },
  create: (data: Partial<Tenant> & { apartmentId: string }) => api.post<Tenant>("/tenants", data),
  update: (id: string, data: Partial<Tenant>) => api.put<Tenant>(`/tenants/${id}`, data),
  remove: (id: string) => api.delete(`/tenants/${id}`),
  createAccount: (id: string, username: string, password: string) =>
    api.post(`/tenants/${id}/account`, { username, password }),
};

export const paymentsApi = {
  list: (apartmentId?: string) =>
    api.get<Payment[]>(apartmentId ? `/payments?apartmentId=${apartmentId}` : "/payments"),
  create: (data: Partial<Payment> & { tenantId: string; amount: number; date: string }) =>
    api.post<Payment>("/payments", data),
  update: (id: string, data: Partial<Payment>) => api.put<Payment>(`/payments/${id}`, data),
  remove: (id: string) => api.delete(`/payments/${id}`),
};

export const usersApi = {
  list: () => api.get<UserRole[]>("/users"),
  create: (data: Partial<UserRole> & { password: string }) => api.post<UserRole>("/users", data),
  update: (id: string, data: Partial<UserRole>) => api.put<UserRole>(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
};

export const activitiesApi = {
  list: (apartmentId?: string) =>
    api.get<ActivityLog[]>(
      apartmentId ? `/activities?apartmentId=${apartmentId}` : "/activities"
    ),
  create: (data: Partial<ActivityLog>) => api.post<ActivityLog>("/activities", data),
};

export const advertisementsApi = {
  list: () => api.get<any[]>("/advertisements"),
  create: (data: any) => api.post("/advertisements", data),
  update: (id: string, data: any) => api.put(`/advertisements/${id}`, data),
  remove: (id: string) => api.delete(`/advertisements/${id}`),
};

export const documentsApi = {
  list: (apartmentId?: string) =>
    api.get<any[]>(apartmentId ? `/documents?apartmentId=${apartmentId}` : "/documents"),
  create: (formData: FormData) => api.upload("/documents", formData),
  createJson: (data: any) => api.post("/documents", data),
  update: (id: string, data: any) => api.put(`/documents/${id}`, data),
  remove: (id: string) => api.delete(`/documents/${id}`),
};

export const maintenanceApi = {
  list: () => api.get<any[]>("/maintenance"),
  create: (data: any) => api.post("/maintenance", data),
  update: (id: string, data: any) => api.put(`/maintenance/${id}`, data),
  remove: (id: string) => api.delete(`/maintenance/${id}`),
};

export const inspectionsApi = {
  list: () => api.get<any[]>("/inspections"),
  create: (data: any) => api.post("/inspections", data),
  update: (id: string, data: any) => api.put(`/inspections/${id}`, data),
  remove: (id: string) => api.delete(`/inspections/${id}`),
};

export const budgetsApi = {
  list: () => api.get<any[]>("/budgets"),
  create: (data: any) => api.post("/budgets", data),
  update: (id: string, data: any) => api.put(`/budgets/${id}`, data),
  remove: (id: string) => api.delete(`/budgets/${id}`),
};

export const landsApi = {
  list: () => api.get<any[]>("/lands"),
  create: (data: any) => api.post("/lands", data),
  update: (id: string, data: any) => api.put(`/lands/${id}`, data),
  remove: (id: string) => api.delete(`/lands/${id}`),
};

export const notificationsApi = {
  list: () => api.get<any[]>("/notifications"),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};

export const uploadsApi = {
  file: (category: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.upload<{ url: string; fileName: string; mimeType: string; size: number }>(
      `/uploads/${category}`,
      fd
    );
  },
};

export const dashboardApi = {
  summary: () => api.get<any>("/dashboard/summary"),
};
