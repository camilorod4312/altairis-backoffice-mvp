"use client";

import * as React from "react";
import {
  Box,
  Container,
  Button,
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
import { getUser } from "@/lib/auth";
import { format, useI18n } from "@/lib/i18n";
import Link from "next/link";

type HotelListItem = {
  id: number;
  name: string;
  city: string;
  country: string;
  isActive: boolean;
};

type PagedResult<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
};

export default function HotelsPage() {
  const { t } = useI18n();
  const [query, setQuery] = React.useState("");
  const [data, setData] = React.useState<PagedResult<HotelListItem> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const u = getUser();
    setRole(u?.role ?? null);
  }, []);

  const canCreate = role === "Admin";

  React.useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setError(null);
        const url = new URL("/api/hotels", "http://local");
        url.searchParams.set("page", "1");
        url.searchParams.set("pageSize", "25");
        if (query.trim()) url.searchParams.set("q", query.trim());

        const json = await apiFetch<PagedResult<HotelListItem>>(
          url.pathname + url.search,
          { signal: controller.signal, auth: true },
        );
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
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            {t("hotels.title")}
          </Typography>

          <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
              <TextField
                label={t("common.search")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("hotels.searchPlaceholder")}
                size="small"
              />

              {canCreate ? (
                <Button component={Link} href="/hotels/create" variant="contained">
                  {t("hotels.createButton")}
                </Button>
              ) : null}

              {error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("hotels.col.name")}</TableCell>
                      <TableCell>{t("hotels.col.city")}</TableCell>
                      <TableCell>{t("hotels.col.country")}</TableCell>
                      <TableCell>{t("common.status")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data?.items ?? []).map((h) => (
                      <TableRow key={h.id} hover>
                        <TableCell>{h.name}</TableCell>
                        <TableCell>{h.city}</TableCell>
                        <TableCell>{h.country}</TableCell>
                        <TableCell>
                          {h.isActive ? t("common.active") : t("common.inactive")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {data ? (
                <Typography variant="body2" color="text.secondary">
                  {format(t("common.showing"), {
                    count: data.items.length,
                    total: data.total,
                  })}
                </Typography>
              ) : null}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

