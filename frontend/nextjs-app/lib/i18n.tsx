"use client";

import * as React from "react";

export type Lang = "en" | "es";

type Dictionary = Record<string, string>;

const dict: Record<Lang, Dictionary> = {
  en: {
    "app.title": "Altairis Booking Backoffice",
    "app.subtitle": "Backoffice",
    "lang.english": "English",
    "lang.spanish": "Spanish",
    "nav.hotels": "Hotels",
    "nav.roomTypes": "Room types",
    "nav.inventory": "Inventory",
    "nav.reservations": "Reservations",
    "nav.users": "Users",
    "nav.dashboard": "Dashboard",
    "auth.notSignedIn": "Not signed in",
    "auth.signOut": "Sign out",
    "auth.signIn": "Sign in",
    "auth.signingIn": "Signing in...",
    "auth.loginFailed": "Login failed",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.useSeeded": "Use one of the seeded users (admin/owner/ops).",
    "auth.demoUsers": "Demo users:",
    "errors.unauthorized": "Unauthorized",
    "errors.forbidden": "Forbidden",
    "errors.badRequest": "Bad request",
    "errors.notFound": "Not found",
    "errors.conflict": "Conflict",
    "errors.serverError": "Server error",
    "errors.network": "Network error",
    "errors.generic": "Something went wrong",
    "common.search": "Search",
    "common.create": "Create",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.saving": "Saving...",
    "common.creating": "Creating...",
    "common.status": "Status",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.showing": "Showing {count} of {total}",
    "hotels.title": "Hotels",
    "hotels.searchPlaceholder": "Name, city, country",
    "hotels.createButton": "Create hotel",
    "hotels.createTitle": "Create hotel",
    "hotels.createFailed": "Create hotel failed",
    "hotels.field.owner": "Owner",
    "hotels.field.name": "Name",
    "hotels.field.city": "City",
    "hotels.field.country": "Country",
    "hotels.field.addressLine1": "Address line 1",
    "hotels.field.postalCode": "Postal code",
    "hotels.field.isActive": "Active",
    "hotels.col.name": "Name",
    "hotels.col.city": "City",
    "hotels.col.country": "Country",
    "roomTypes.title": "Room types",
    "roomTypes.searchPlaceholder": "Code or name",
    "roomTypes.createTitle": "Create room type",
    "roomTypes.col.hotel": "Hotel",
    "roomTypes.col.code": "Code",
    "roomTypes.col.name": "Name",
    "roomTypes.col.maxOcc": "Max occ.",
    "roomTypes.field.hotelId": "Hotel",
    "roomTypes.field.code": "Code",
    "roomTypes.field.name": "Name",
    "roomTypes.field.maxOcc": "Max occupancy",
    "roomTypes.createFailed": "Create failed",
    "inventory.title": "Inventory",
    "inventory.upsert": "Upsert",
    "inventory.upsertTitle": "Upsert inventory entry",
    "inventory.col.date": "Date",
    "inventory.col.hotel": "Hotel",
    "inventory.col.roomType": "Room type",
    "inventory.col.total": "Total",
    "inventory.col.available": "Available",
    "inventory.field.hotelId": "Hotel",
    "inventory.field.roomTypeId": "Room type",
    "inventory.field.date": "Date",
    "inventory.field.totalUnits": "Total units",
    "inventory.field.availableUnits": "Available units",
    "inventory.upsertFailed": "Upsert failed",
    "reservations.title": "Reservations",
    "reservations.searchPlaceholder": "Reference or guest",
    "reservations.createTitle": "Create reservation",
    "reservations.col.reference": "Reference",
    "reservations.col.guest": "Guest",
    "reservations.col.hotel": "Hotel",
    "reservations.col.roomType": "Room type",
    "reservations.col.checkIn": "Check-in",
    "reservations.col.checkOut": "Check-out",
    "reservations.col.units": "Units",
    "reservations.field.hotelId": "Hotel",
    "reservations.field.roomTypeId": "Room type",
    "reservations.field.guestName": "Guest name",
    "reservations.field.guestEmail": "Guest email (optional)",
    "reservations.field.checkIn": "Check-in",
    "reservations.field.checkOut": "Check-out",
    "reservations.field.units": "Units",
    "reservations.createFailed": "Create failed",

    "users.title": "Users",
    "users.searchPlaceholder": "Email or role",
    "users.col.email": "Email",
    "users.col.role": "Role",
    "users.col.hotel": "Hotel",
    "users.col.active": "Active",
    "users.col.created": "Created",
    "users.createTitle": "Create user",
    "users.editTitle": "Edit user",
    "users.field.email": "Email",
    "users.field.role": "Role",
    "users.field.hotel": "Hotel",
    "users.field.password": "Password (optional on edit)",
    "users.field.isActive": "Active",
    "users.saveFailed": "Save failed",
    "users.assignmentsInfoTitle": "Assignment scope is refreshed",
    "users.assignmentsInfoBody": "Owners may need to sign out and sign back in to see updated hotel assignments.",

    "role.Admin": "Admin",
    "role.HotelOwner": "Hotel owner",
    "role.Ops": "Operations",

    "dashboard.title": "Operations dashboard",
    "dashboard.today": "Today",
    "dashboard.arrivals": "Arrivals",
    "dashboard.departures": "Departures",
    "dashboard.bookings": "Bookings",
    "dashboard.statusBreakdown": "Status breakdown",
    "dashboard.last7Days": "Last 7 days (created)",
    "dashboard.noData": "No data",
    "dashboard.filters": "Filters",
    "dashboard.filter.date": "Date",
    "dashboard.filter.hotel": "Hotel",
    "dashboard.allHotels": "All hotels",
    "dashboard.occupancy": "Occupancy (proxy)",
    "dashboard.occupancyUnits": "Available {available} / Total {total}",

    "inventory.view.table": "Table",
    "inventory.view.heatmap": "Heatmap",
    "inventory.heatmap.title": "Inventory heatmap",
    "inventory.heatmap.from": "From",
    "inventory.heatmap.to": "To",
    "inventory.heatmap.legend.low": "Low",
    "inventory.heatmap.legend.medium": "Medium",
    "inventory.heatmap.legend.high": "High",
  },
  es: {
    "app.title": "Backoffice de Reservas Altairis",
    "app.subtitle": "Backoffice",
    "lang.english": "Inglés",
    "lang.spanish": "Español",
    "nav.hotels": "Hoteles",
    "nav.roomTypes": "Tipos de habitación",
    "nav.inventory": "Inventario",
    "nav.reservations": "Reservas",
    "nav.users": "Usuarios",
    "nav.dashboard": "Panel",
    "auth.notSignedIn": "Sin sesión",
    "auth.signOut": "Cerrar sesión",
    "auth.signIn": "Iniciar sesión",
    "auth.signingIn": "Iniciando...",
    "auth.loginFailed": "Error al iniciar sesión",
    "auth.email": "Correo",
    "auth.password": "Contraseña",
    "auth.useSeeded": "Usa uno de los usuarios precargados (admin/owner/ops).",
    "auth.demoUsers": "Usuarios de demo:",
    "errors.unauthorized": "No autorizado",
    "errors.forbidden": "Prohibido",
    "errors.badRequest": "Solicitud no válida",
    "errors.notFound": "No encontrado",
    "errors.conflict": "Conflicto",
    "errors.serverError": "Error del servidor",
    "errors.network": "Error de red",
    "errors.generic": "Algo salió mal",
    "common.search": "Buscar",
    "common.create": "Crear",
    "common.cancel": "Cancelar",
    "common.save": "Guardar",
    "common.saving": "Guardando...",
    "common.creating": "Creando...",
    "common.status": "Estado",
    "common.active": "Activo",
    "common.inactive": "Inactivo",
    "common.showing": "Mostrando {count} de {total}",
    "hotels.title": "Hoteles",
    "hotels.searchPlaceholder": "Nombre, ciudad, país",
    "hotels.createButton": "Crear hotel",
    "hotels.createTitle": "Crear hotel",
    "hotels.createFailed": "Error al crear hotel",
    "hotels.field.owner": "Propietario",
    "hotels.field.name": "Nombre",
    "hotels.field.city": "Ciudad",
    "hotels.field.country": "País",
    "hotels.field.addressLine1": "Dirección (línea 1)",
    "hotels.field.postalCode": "Código postal",
    "hotels.field.isActive": "Activo",
    "hotels.col.name": "Nombre",
    "hotels.col.city": "Ciudad",
    "hotels.col.country": "País",
    "roomTypes.title": "Tipos de habitación",
    "roomTypes.searchPlaceholder": "Código o nombre",
    "roomTypes.createTitle": "Crear tipo de habitación",
    "roomTypes.col.hotel": "Hotel",
    "roomTypes.col.code": "Código",
    "roomTypes.col.name": "Nombre",
    "roomTypes.col.maxOcc": "Máx. ocupación",
    "roomTypes.field.hotelId": "Hotel",
    "roomTypes.field.code": "Código",
    "roomTypes.field.name": "Nombre",
    "roomTypes.field.maxOcc": "Ocupación máxima",
    "roomTypes.createFailed": "Error al crear",
    "inventory.title": "Inventario",
    "inventory.upsert": "Actualizar",
    "inventory.upsertTitle": "Actualizar inventario",
    "inventory.col.date": "Fecha",
    "inventory.col.hotel": "Hotel",
    "inventory.col.roomType": "Tipo de habitación",
    "inventory.col.total": "Total",
    "inventory.col.available": "Disponible",
    "inventory.field.hotelId": "Hotel",
    "inventory.field.roomTypeId": "Tipo de habitación",
    "inventory.field.date": "Fecha",
    "inventory.field.totalUnits": "Unidades totales",
    "inventory.field.availableUnits": "Unidades disponibles",
    "inventory.upsertFailed": "Error al actualizar",
    "reservations.title": "Reservas",
    "reservations.searchPlaceholder": "Referencia o huésped",
    "reservations.createTitle": "Crear reserva",
    "reservations.col.reference": "Referencia",
    "reservations.col.guest": "Huésped",
    "reservations.col.hotel": "Hotel",
    "reservations.col.roomType": "Tipo de habitación",
    "reservations.col.checkIn": "Entrada",
    "reservations.col.checkOut": "Salida",
    "reservations.col.units": "Unidades",
    "reservations.field.hotelId": "Hotel",
    "reservations.field.roomTypeId": "Tipo de habitación",
    "reservations.field.guestName": "Nombre del huésped",
    "reservations.field.guestEmail": "Correo del huésped (opcional)",
    "reservations.field.checkIn": "Entrada",
    "reservations.field.checkOut": "Salida",
    "reservations.field.units": "Unidades",
    "reservations.createFailed": "Error al crear",

    "users.title": "Usuarios",
    "users.searchPlaceholder": "Correo o rol",
    "users.col.email": "Correo",
    "users.col.role": "Rol",
    "users.col.hotel": "Hotel",
    "users.col.active": "Activo",
    "users.col.created": "Creado",
    "users.createTitle": "Crear usuario",
    "users.editTitle": "Editar usuario",
    "users.field.email": "Correo",
    "users.field.role": "Rol",
    "users.field.hotel": "Hotel",
    "users.field.password": "Contraseña (opcional al editar)",
    "users.field.isActive": "Activo",
    "users.saveFailed": "Error al guardar",
    "users.assignmentsInfoTitle": "Los permisos se han actualizado",
    "users.assignmentsInfoBody": "Los propietarios pueden necesitar cerrar sesión y volver a iniciarla para ver las asignaciones de hotel actualizadas.",

    "role.Admin": "Admin",
    "role.HotelOwner": "Propietario",
    "role.Ops": "Operaciones",

    "dashboard.title": "Panel operativo",
    "dashboard.today": "Hoy",
    "dashboard.arrivals": "Llegadas",
    "dashboard.departures": "Salidas",
    "dashboard.bookings": "Reservas",
    "dashboard.statusBreakdown": "Estados",
    "dashboard.last7Days": "Últimos 7 días (creadas)",
    "dashboard.noData": "Sin datos",
    "dashboard.filters": "Filtros",
    "dashboard.filter.date": "Fecha",
    "dashboard.filter.hotel": "Hotel",
    "dashboard.allHotels": "Todos los hoteles",
    "dashboard.occupancy": "Ocupación (aprox.)",
    "dashboard.occupancyUnits": "Disponible {available} / Total {total}",

    "inventory.view.table": "Tabla",
    "inventory.view.heatmap": "Mapa",
    "inventory.heatmap.title": "Mapa de inventario",
    "inventory.heatmap.from": "Desde",
    "inventory.heatmap.to": "Hasta",
    "inventory.heatmap.legend.low": "Bajo",
    "inventory.heatmap.legend.medium": "Medio",
    "inventory.heatmap.legend.high": "Alto",
  },
};

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

function readInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem("altairis.lang");
  if (stored === "en" || stored === "es") return stored;
  const nav = window.navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("es")) return "es";
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("en");

  React.useEffect(() => {
    setLangState(readInitialLang());
  }, []);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("altairis.lang", l);
    }
  }, []);

  const t = React.useCallback(
    (key: string) => dict[lang][key] ?? dict.en[key] ?? key,
    [lang],
  );

  const value = React.useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function format(tpl: string, vars: Record<string, string | number>) {
  return tpl.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

