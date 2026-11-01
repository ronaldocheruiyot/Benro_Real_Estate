import { useCallback, useEffect, useRef, useState } from "react";
import type { Apartment } from "../components/ApartmentCard";

export type AppView =
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
  | "landManagement"
  | "payments";

const VALID_VIEWS = new Set<string>([
  "dashboard",
  "profile",
  "settings",
  "help",
  "tenants",
  "activeTenants",
  "failedToPay",
  "tenantsLeft",
  "vacantUnits",
  "paymentHistory",
  "activityLog",
  "units",
  "financialReports",
  "userManagement",
  "advertisements",
  "houses",
  "tenantsByApartment",
  "landManagement",
  "payments",
]);

const TOP_LEVEL = new Set([
  "dashboard",
  "houses",
  "advertisements",
  "landManagement",
  "userManagement",
  "financialReports",
  "profile",
  "settings",
  "help",
  "tenantsByApartment",
  "payments",
]);

type HistoryState = {
  view: AppView;
  apartmentId: string | null;
};

function parseLocation(apartments: Apartment[]): HistoryState {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [pathPart, queryPart] = raw.split("?");
  const viewName = (pathPart || "dashboard").split("/")[0];
  const view = (VALID_VIEWS.has(viewName) ? viewName : "dashboard") as AppView;
  const params = new URLSearchParams(queryPart || "");
  const apartmentId = params.get("apartmentId");
  if (apartmentId && apartments.some((a) => a.id === apartmentId)) {
    return { view, apartmentId };
  }
  // Keep apartment id from URL even if apartments not loaded yet
  if (apartmentId) return { view, apartmentId };
  return { view, apartmentId: null };
}

function buildHash(view: AppView, apartmentId: string | null) {
  if (apartmentId) return `#/${view}?apartmentId=${encodeURIComponent(apartmentId)}`;
  return `#/${view}`;
}

/**
 * Syncs app pages with browser history so Back / Forward work
 * on phone and desktop browsers (and in-app webviews).
 */
export function useBrowserHistoryNav(apartments: Apartment[]) {
  const [currentView, setCurrentViewState] = useState<AppView>("dashboard");
  const [selectedApartment, setSelectedApartmentState] = useState<Apartment | null>(null);
  const apartmentsRef = useRef(apartments);
  const selectedRef = useRef<Apartment | null>(null);
  apartmentsRef.current = apartments;
  selectedRef.current = selectedApartment;

  const applyFromHistory = useCallback((state: HistoryState) => {
    const apt = state.apartmentId
      ? apartmentsRef.current.find((a) => a.id === state.apartmentId) || null
      : selectedRef.current && !TOP_LEVEL.has(state.view)
        ? selectedRef.current
        : null;

    setCurrentViewState(state.view);
    if (state.apartmentId) {
      setSelectedApartmentState(
        apartmentsRef.current.find((a) => a.id === state.apartmentId) || apt
      );
    } else if (TOP_LEVEL.has(state.view)) {
      // keep apartment in memory for quick return, view comes from history
    }
  }, []);

  useEffect(() => {
    const initial = parseLocation(apartmentsRef.current);
    applyFromHistory(initial);
    const hash = buildHash(initial.view, initial.apartmentId);
    window.history.replaceState(
      { view: initial.view, apartmentId: initial.apartmentId } satisfies HistoryState,
      "",
      hash || "#/dashboard"
    );

    const onPop = (event: PopStateEvent) => {
      const state = (event.state as HistoryState | null) || parseLocation(apartmentsRef.current);
      if (!VALID_VIEWS.has(state.view)) {
        applyFromHistory({ view: "dashboard", apartmentId: null });
        return;
      }
      applyFromHistory({
        view: state.view,
        apartmentId: state.apartmentId ?? null,
      });
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [applyFromHistory]);

  // When apartments finish loading, hydrate selected apartment from URL
  useEffect(() => {
    const { apartmentId } = parseLocation(apartments);
    if (!apartmentId) return;
    const apt = apartments.find((a) => a.id === apartmentId);
    if (apt) setSelectedApartmentState(apt);
  }, [apartments]);

  const navigate = useCallback(
    (view: AppView | string, options?: { apartment?: Apartment | null; replace?: boolean }) => {
      const nextView = (VALID_VIEWS.has(String(view)) ? view : "dashboard") as AppView;

      let apartment: Apartment | null =
        options && "apartment" in options ? options.apartment ?? null : selectedRef.current;

      const urlApartmentId = TOP_LEVEL.has(nextView) ? null : apartment?.id ?? null;

      setCurrentViewState(nextView);
      if (options && "apartment" in options) {
        setSelectedApartmentState(options.apartment ?? null);
        apartment = options.apartment ?? null;
      }

      const hash = buildHash(nextView, urlApartmentId);
      const historyState: HistoryState = { view: nextView, apartmentId: urlApartmentId };

      const current = window.history.state as HistoryState | null;
      if (
        current?.view === historyState.view &&
        current?.apartmentId === historyState.apartmentId &&
        window.location.hash === hash
      ) {
        return;
      }

      if (options?.replace) {
        window.history.replaceState(historyState, "", hash);
      } else {
        window.history.pushState(historyState, "", hash);
      }
    },
    []
  );

  const resetToDashboard = useCallback(() => {
    setSelectedApartmentState(null);
    navigate("dashboard", { apartment: null, replace: true });
  }, [navigate]);

  return {
    currentView,
    selectedApartment,
    navigate,
    resetToDashboard,
  };
}
