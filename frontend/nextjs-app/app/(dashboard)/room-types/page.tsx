"use client";

import * as React from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage } from "@/lib/apiError";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useLookups } from "@/lib/lookups";
import { getUser } from "@/lib/auth";

type RoomTypeListItem = {
  id: number;
  hotelId: number;
  code: string;
  name: string;
  maxOccupancy: number;
};

type PagedResult<T> = { page: number; pageSize: number; total: number; items: T[] };

export default function RoomTypesPage() {
  const { t } = useI18n();
  const { hotelsById } = useLookups();
  const [query, setQuery] = React.useState("");
  const [data, setData] = React.useState<PagedResult<RoomTypeListItem> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const u = getUser();
    setRole(u?.role ?? null);
  }, []);

  const canCreate = role === "Admin" || role === "HotelOwner";

  React.useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setError(null);
        const url = new URL("/api/room-types", "http://local");
        url.searchParams.set("page", "1");
        url.searchParams.set("pageSize", "25");
        if (query.trim()) url.searchParams.set("q", query.trim());
        const json = await apiFetch<PagedResult<RoomTypeListItem>>(url.pathname + url.search, {
          signal: controller.signal,
          auth: true,
        });
        setData(json);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError(apiErrorMessage(e, t, "errors.generic"));
      }
    }
    load();
    return () => controller.abort();
  }, [query]);

  return (
    <Box sx={{ py: 1 }}>
      <Container maxWidth="lg">
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            {t("roomTypes.title")}
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                <TextField
                  label={t("common.search")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("roomTypes.searchPlaceholder")}
                  size="small"
                  sx={{ maxWidth: 420, width: "100%" }}
                />
                {canCreate ? (
                  <Button component={Link} href="/room-types/create" variant="contained">
                    {t("common.create")}
                  </Button>
                ) : null}
              </Stack>

              {error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("roomTypes.col.hotel")}</TableCell>
                      <TableCell>{t("roomTypes.col.code")}</TableCell>
                      <TableCell>{t("roomTypes.col.name")}</TableCell>
                      <TableCell align="right">{t("roomTypes.col.maxOcc")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data?.items ?? []).map((rt) => (
                      <TableRow key={rt.id} hover>
                        <TableCell>{hotelsById.get(rt.hotelId)?.name ?? "-"}</TableCell>
                        <TableCell>{rt.code}</TableCell>
                        <TableCell>{rt.name}</TableCell>
                        <TableCell align="right">{rt.maxOccupancy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

