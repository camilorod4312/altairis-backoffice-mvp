"use client";

import * as React from "react";
import { apiFetch } from "@/lib/api";

type PagedResult<T> = { page: number; pageSize: number; total: number; items: T[] };

export type HotelLookup = { id: number; name: string };
export type RoomTypeLookup = { id: number; hotelId: number; name: string; code: string };

export function useLookups() {
  const [hotels, setHotels] = React.useState<HotelLookup[]>([]);
  const [roomTypes, setRoomTypes] = React.useState<RoomTypeLookup[]>([]);

  React.useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const hotelsUrl = new URL("/api/hotels", "http://local");
        hotelsUrl.searchParams.set("page", "1");
        hotelsUrl.searchParams.set("pageSize", "500");

        const roomTypesUrl = new URL("/api/room-types", "http://local");
        roomTypesUrl.searchParams.set("page", "1");
        roomTypesUrl.searchParams.set("pageSize", "1000");

        const [hotelsRes, roomTypesRes] = await Promise.all([
          apiFetch<PagedResult<HotelLookup>>(hotelsUrl.pathname + hotelsUrl.search, {
            signal: controller.signal,
            auth: true,
          }),
          apiFetch<PagedResult<RoomTypeLookup>>(roomTypesUrl.pathname + roomTypesUrl.search, {
            signal: controller.signal,
            auth: true,
          }),
        ]);

        // Hotels are tenant-scoped by the backend.
        setHotels(hotelsRes.items);
        setRoomTypes(roomTypesRes.items);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        // Lookups are best-effort; pages can still render.
        setHotels([]);
        setRoomTypes([]);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const hotelsById = React.useMemo(() => {
    const m = new Map<number, HotelLookup>();
    for (const h of hotels) m.set(h.id, h);
    return m;
  }, [hotels]);

  const roomTypesById = React.useMemo(() => {
    const m = new Map<number, RoomTypeLookup>();
    for (const rt of roomTypes) m.set(rt.id, rt);
    return m;
  }, [roomTypes]);

  return { hotels, roomTypes, hotelsById, roomTypesById };
}

