"use client";

import * as React from "react";
import {
  Box,
  Container,
  FormControl,
  LinearProgress,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { apiFetch } from "@/lib/api";
import { apiErrorMessage } from "@/lib/apiError";
import { format, useI18n } from "@/lib/i18n";
import { useLookups } from "@/lib/lookups";

type StatusCount = { status: string; count: number };
type Occupancy = { totalUnits: number; availableUnits: number };
type RecentBooking = { id: number; reference: string; hotelId: number; guestName: string };

type DashboardData = {
  arrivals: number;
  departures: number;
  totalBookings: number;
  statusBreakdown: StatusCount[];
  occupancy: Occupancy;
  recentBookings: RecentBooking[];
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { t } = useI18n();
  const { hotelsById, hotels } = useLookups();

  const [selectedDate, setSelectedDate] = React.useState(() => isoDate(new Date()));
  const [hotelId, setHotelId] = React.useState<number | "all">("all");

  const [data, setData] = React.useState<DashboardData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setError(null);
        const url = new URL("/api/dashboard", "http://local");
        url.searchParams.set("date", selectedDate);
        if (hotelId !== "all") url.searchParams.set("hotelId", String(hotelId));

        const result = await apiFetch<DashboardData>(url.pathname + url.search, {
          signal: controller.signal,
          auth: true,
        });

        setData(result);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError(apiErrorMessage(e, t, "errors.generic"));
      }
    }

    load();
    return () => controller.abort();
  }, [hotelId, selectedDate]);

  const arrivals = data?.arrivals ?? 0;
  const departures = data?.departures ?? 0;
  const totalBookings = data?.totalBookings ?? 0;
  const statusBreakdown = data?.statusBreakdown ?? [];
  const recentBookings = data?.recentBookings ?? [];

  const totalUnits = data?.occupancy.totalUnits ?? 0;
  const availableUnits = data?.occupancy.availableUnits ?? 0;
  const booked = Math.max(0, totalUnits - availableUnits);
  const occupancyRatio = totalUnits > 0 ? (booked / totalUnits) * 100 : 0;

  const totalForBreakdown = statusBreakdown.reduce((acc, s) => acc + s.count, 0) || 1;

  return (
    <Box sx={{ py: 1 }}>
      <Container maxWidth="lg">
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            {t("dashboard.title")}
          </Typography>

          {error ? <Typography color="error">{error}</Typography> : null}

          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
              <Typography fontWeight={700}>{t("dashboard.filters")}</Typography>
              <TextField
                label={t("dashboard.filter.date")}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <FormControl size="small" sx={{ minWidth: 240 }}>
                <InputLabel id="hotel-filter-label">{t("dashboard.filter.hotel")}</InputLabel>
                <Select
                  labelId="hotel-filter-label"
                  label={t("dashboard.filter.hotel")}
                  value={hotelId}
                  onChange={(e) =>
                    setHotelId(e.target.value === "all" ? "all" : Number(e.target.value))
                  }
                >
                  <MenuItem value="all">{t("dashboard.allHotels")}</MenuItem>
                  {hotels.map((h) => (
                    <MenuItem key={h.id} value={h.id}>
                      {h.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ flex: 1 }} />
              <Stack spacing={0.5} sx={{ minWidth: 280 }}>
                <Typography variant="body2" fontWeight={700}>
                  {t("dashboard.occupancy")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {format(t("dashboard.occupancyUnits"), {
                    available: availableUnits,
                    total: totalUnits,
                  })}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Math.max(0, occupancyRatio))}
                  sx={{ height: 8, borderRadius: 8 }}
                />
              </Stack>
            </Stack>
          </Paper>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" },
            }}
          >
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  {t("dashboard.today")}
                </Typography>
                <Typography variant="h3" fontWeight={800}>
                  {arrivals}
                </Typography>
                <Typography color="text.secondary">{t("dashboard.arrivals")}</Typography>
              </Paper>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  {t("dashboard.today")}
                </Typography>
                <Typography variant="h3" fontWeight={800}>
                  {departures}
                </Typography>
                <Typography color="text.secondary">{t("dashboard.departures")}</Typography>
              </Paper>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  {t("dashboard.today")}
                </Typography>
                <Typography variant="h3" fontWeight={800}>
                  {totalBookings}
                </Typography>
                <Typography color="text.secondary">{t("dashboard.bookings")}</Typography>
              </Paper>
            </Box>

            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 7" } }}>
              <Paper sx={{ p: 2 }}>
                <Typography fontWeight={700}>{t("dashboard.statusBreakdown")}</Typography>
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {statusBreakdown.length === 0 ? (
                    <Typography color="text.secondary">{t("dashboard.noData")}</Typography>
                  ) : (
                    statusBreakdown.map((s) => (
                      <Box key={s.status}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">{s.status}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {s.count}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(s.count / totalForBreakdown) * 100}
                          sx={{ height: 8, borderRadius: 8 }}
                        />
                      </Box>
                    ))
                  )}
                </Stack>
              </Paper>
            </Box>

            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 5" } }}>
              <Paper sx={{ p: 2 }}>
                <Typography fontWeight={700}>{t("dashboard.today")}</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {recentBookings.map((r) => (
                    <Box key={r.id} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                        {r.reference} · {r.guestName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {hotelsById.get(r.hotelId)?.name ?? "-"}
                      </Typography>
                    </Box>
                  ))}
                  {totalBookings > 6 ? (
                    <Typography variant="body2" color="text.secondary">
                      +{totalBookings - 6}
                    </Typography>
                  ) : null}
                </Stack>
              </Paper>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
