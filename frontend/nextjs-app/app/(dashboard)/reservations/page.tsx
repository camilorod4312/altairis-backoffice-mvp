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

type ReservationListItem = {
  id: number;
  reference: string;
  hotelId: number;
  roomTypeId: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
  units: number;
  status: string;
  createdUtc: string;
};

type PagedResult<T> = { page: number; pageSize: number; total: number; items: T[] };

export default function ReservationsPage() {
  const { t } = useI18n();
  const { hotelsById, roomTypesById } = useLookups();
  const [query, setQuery] = React.useState("");
  const [data, setData] = React.useState<PagedResult<ReservationListItem> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setError(null);
        const url = new URL("/api/reservations", "http://local");
        url.searchParams.set("page", "1");
        url.searchParams.set("pageSize", "25");
        if (query.trim()) url.searchParams.set("q", query.trim());
        const json = await apiFetch<PagedResult<ReservationListItem>>(url.pathname + url.search, {
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
            {t("reservations.title")}
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                <TextField
                  label={t("common.search")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("reservations.searchPlaceholder")}
                  size="small"
                  sx={{ maxWidth: 420, width: "100%" }}
                />
                <Button component={Link} href="/reservations/create" variant="contained">
                  {t("common.create")}
                </Button>
              </Stack>

              {error ? <Typography color="error">{error}</Typography> : null}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("reservations.col.reference")}</TableCell>
                    <TableCell>{t("reservations.col.guest")}</TableCell>
                    <TableCell>{t("reservations.col.hotel")}</TableCell>
                    <TableCell>{t("reservations.col.roomType")}</TableCell>
                    <TableCell>{t("reservations.col.checkIn")}</TableCell>
                    <TableCell>{t("reservations.col.checkOut")}</TableCell>
                    <TableCell align="right">{t("reservations.col.units")}</TableCell>
                    <TableCell>{t("common.status")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.items ?? []).map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.reference}</TableCell>
                      <TableCell>{r.guestName}</TableCell>
                      <TableCell>{hotelsById.get(r.hotelId)?.name ?? "-"}</TableCell>
                      <TableCell>{roomTypesById.get(r.roomTypeId)?.name ?? "-"}</TableCell>
                      <TableCell>{r.checkIn}</TableCell>
                      <TableCell>{r.checkOut}</TableCell>
                      <TableCell align="right">{r.units}</TableCell>
                      <TableCell>{r.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

