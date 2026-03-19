"use client";

import * as React from "react";
import {
  Box,
  Button,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Stack,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage } from "@/lib/apiError";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useLookups } from "@/lib/lookups";

type InventoryEntry = {
  id: number;
  hotelId: number;
  roomTypeId: number;
  date: string;
  totalUnits: number;
  availableUnits: number;
};

type PagedResult<T> = { page: number; pageSize: number; total: number; items: T[] };

export default function InventoryPage() {
  const { t } = useI18n();
  const { hotelsById, roomTypesById, roomTypes } = useLookups();
  const [data, setData] = React.useState<PagedResult<InventoryEntry> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [view, setView] = React.useState<"table" | "heatmap">("heatmap");

  const todayIso = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const defaultToIso = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 13);
    return d.toISOString().slice(0, 10);
  }, []);
  const [from, setFrom] = React.useState(todayIso);
  const [to, setTo] = React.useState(defaultToIso);

  const [heatmap, setHeatmap] = React.useState<InventoryEntry[]>([]);

  React.useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setError(null);
        const url = new URL("/api/inventory", "http://local");
        url.searchParams.set("page", "1");
        url.searchParams.set("pageSize", "50");
        const json = await apiFetch<PagedResult<InventoryEntry>>(url.pathname + url.search, {
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
  }, []);

  React.useEffect(() => {
    if (view !== "heatmap") return;
    const controller = new AbortController();
    async function loadHeatmap() {
      try {
        setError(null);
        const url = new URL("/api/inventory", "http://local");
        url.searchParams.set("page", "1");
        url.searchParams.set("pageSize", "2000");
        url.searchParams.set("from", from);
        url.searchParams.set("to", to);
        const json = await apiFetch<PagedResult<InventoryEntry>>(url.pathname + url.search, {
          signal: controller.signal,
          auth: true,
        });
        setHeatmap(json.items ?? []);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError(apiErrorMessage(e, t, "errors.generic"));
      }
    }
    loadHeatmap();
    return () => controller.abort();
  }, [from, to, view]);

  const dateCols = React.useMemo(() => {
    const out: string[] = [];
    const start = new Date(from);
    const end = new Date(to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }, [from, to]);

  const byRoomTypeAndDate = React.useMemo(() => {
    const m = new Map<string, InventoryEntry>();
    for (const e of heatmap) {
      m.set(`${e.roomTypeId}|${e.date}`, e);
    }
    return m;
  }, [heatmap]);

  function cellColor(e: InventoryEntry | undefined) {
    if (!e || e.totalUnits <= 0) return "transparent";
    const ratio = e.availableUnits / e.totalUnits;
    if (ratio <= 0.2) return "rgba(211, 47, 47, 0.22)"; // red-ish
    if (ratio <= 0.6) return "rgba(245, 124, 0, 0.22)"; // orange-ish
    return "rgba(46, 125, 50, 0.18)"; // green-ish
  }

  return (
    <Box sx={{ py: 1 }}>
      <Container maxWidth="lg">
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            {t("inventory.title")}
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, gap: 1 }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={view}
                onChange={(_, v) => v && setView(v)}
              >
                <ToggleButton value="heatmap">{t("inventory.view.heatmap")}</ToggleButton>
                <ToggleButton value="table">{t("inventory.view.table")}</ToggleButton>
              </ToggleButtonGroup>
              <Button component={Link} href="/inventory/upsert" variant="contained">
                {t("inventory.upsert")}
              </Button>
            </Stack>
            {error ? <Typography color="error">{error}</Typography> : null}
            {view === "table" ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("inventory.col.date")}</TableCell>
                    <TableCell>{t("inventory.col.hotel")}</TableCell>
                    <TableCell>{t("inventory.col.roomType")}</TableCell>
                    <TableCell align="right">{t("inventory.col.total")}</TableCell>
                    <TableCell align="right">{t("inventory.col.available")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.items ?? []).map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell>{e.date}</TableCell>
                      <TableCell>{hotelsById.get(e.hotelId)?.name ?? "-"}</TableCell>
                      <TableCell>{roomTypesById.get(e.roomTypeId)?.name ?? "-"}</TableCell>
                      <TableCell align="right">{e.totalUnits}</TableCell>
                      <TableCell align="right">{e.availableUnits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <TextField
                    label={t("inventory.heatmap.from")}
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label={t("inventory.heatmap.to")}
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: "auto" }}>
                    <Box sx={{ width: 14, height: 14, bgcolor: "rgba(211, 47, 47, 0.22)", borderRadius: 0.5 }} />
                    <Typography variant="caption">{t("inventory.heatmap.legend.low")}</Typography>
                    <Box sx={{ width: 14, height: 14, bgcolor: "rgba(245, 124, 0, 0.22)", borderRadius: 0.5 }} />
                    <Typography variant="caption">{t("inventory.heatmap.legend.medium")}</Typography>
                    <Box sx={{ width: 14, height: 14, bgcolor: "rgba(46, 125, 50, 0.18)", borderRadius: 0.5 }} />
                    <Typography variant="caption">{t("inventory.heatmap.legend.high")}</Typography>
                  </Stack>
                </Stack>

                <Box sx={{ overflowX: "auto", border: 1, borderColor: "divider", borderRadius: 2 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ minWidth: 220 }}>{t("inventory.col.roomType")}</TableCell>
                        {dateCols.map((d,i) => (
                            <TableCell key={`${i}-${d}`} sx={{ whiteSpace: "nowrap" }}>
                            {d.slice(5)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {roomTypes.map((rt) => (
                        <TableRow key={rt.id} hover>
                          <TableCell sx={{ minWidth: 220 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {rt.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {hotelsById.get(rt.hotelId)?.name ?? "-"}
                            </Typography>
                          </TableCell>
                          {dateCols.map((d,i) => {
                            const entry = byRoomTypeAndDate.get(`${rt.id}|${d}`);
                            const bg = cellColor(entry);
                            const label = entry
                              ? `${entry.availableUnits}/${entry.totalUnits}`
                              : "-";
                            return (
                              <TableCell key={`${i}-${d}`} sx={{ p: 0.5 }}>
                                <Tooltip title={label}>
                                  <Box
                                    sx={{
                                      height: 26,
                                      borderRadius: 1,
                                      bgcolor: bg,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      border: 1,
                                      borderColor: "divider",
                                      fontSize: 12,
                                    }}
                                  >
                                    {entry ? entry.availableUnits : ""}
                                  </Box>
                                </Tooltip>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Stack>
            )}
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

