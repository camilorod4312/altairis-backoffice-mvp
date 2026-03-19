"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
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
import { useI18n } from "@/lib/i18n";
import { useLookups } from "@/lib/lookups";

type CreateReservationDto = {
  hotelId: number;
  roomTypeId: number;
  guestName: string;
  guestEmail?: string | null;
  checkIn: string; // yyyy-mm-dd
  checkOut: string; // yyyy-mm-dd
  units: number;
};

export default function CreateReservationPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { hotels, roomTypes } = useLookups();
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [form, setForm] = React.useState<CreateReservationDto>({
    hotelId: 0,
    roomTypeId: 0,
    guestName: "",
    guestEmail: "",
    checkIn: today,
    checkOut: tomorrow,
    units: 1,
  });
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (form.hotelId === 0 && hotels.length > 0) {
      setForm((s) => ({ ...s, hotelId: hotels[0]!.id }));
    }
  }, [form.hotelId, hotels]);

  React.useEffect(() => {
    if (form.roomTypeId !== 0) return;
    const candidates = roomTypes.filter((rt) => rt.hotelId === form.hotelId);
    if (candidates.length === 0) return;
    setForm((s) => ({ ...s, roomTypeId: candidates[0]!.id }));
  }, [form.hotelId, form.roomTypeId, roomTypes]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/api/reservations", {
        method: "POST",
        body: JSON.stringify(form),
        auth: true,
      });
      router.push("/reservations");
    } catch (err) {
      setError(apiErrorMessage(err, t, "reservations.createFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ py: 1 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 3 }}>
          <Stack component="form" spacing={2} onSubmit={submit}>
            <Typography variant="h6" fontWeight={700}>
              {t("reservations.createTitle")}
            </Typography>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <FormControl fullWidth>
              <InputLabel id="hotelId-label">{t("reservations.field.hotelId")}</InputLabel>
              <Select
                labelId="hotelId-label"
                label={t("reservations.field.hotelId")}
                value={form.hotelId}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    hotelId: Number(e.target.value),
                    roomTypeId: 0,
                  }))
                }
              >
                {hotels.length === 0 ? (
                  <MenuItem value={0} disabled>
                    -
                  </MenuItem>
                ) : null}
                {hotels.map((h) => (
                  <MenuItem key={h.id} value={h.id}>
                    {h.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="roomTypeId-label">{t("reservations.field.roomTypeId")}</InputLabel>
              <Select
                labelId="roomTypeId-label"
                label={t("reservations.field.roomTypeId")}
                value={form.roomTypeId}
                onChange={(e) =>
                  setForm((s) => ({ ...s, roomTypeId: Number(e.target.value) }))
                }
              >
                {roomTypes
                  .filter((rt) => rt.hotelId === form.hotelId)
                  .map((rt) => (
                    <MenuItem key={rt.id} value={rt.id}>
                      {rt.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              label={t("reservations.field.guestName")}
              value={form.guestName}
              onChange={(e) => setForm((s) => ({ ...s, guestName: e.target.value }))}
            />
            <TextField
              label={t("reservations.field.guestEmail")}
              value={form.guestEmail ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, guestEmail: e.target.value }))}
            />
            <TextField
              label={t("reservations.field.checkIn")}
              type="date"
              value={form.checkIn}
              onChange={(e) => setForm((s) => ({ ...s, checkIn: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label={t("reservations.field.checkOut")}
              type="date"
              value={form.checkOut}
              onChange={(e) => setForm((s) => ({ ...s, checkOut: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label={t("reservations.field.units")}
              type="number"
              value={form.units}
              onChange={(e) => setForm((s) => ({ ...s, units: Number(e.target.value) }))}
            />

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="text" onClick={() => router.push("/reservations")}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? t("common.creating") : t("common.create")}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

