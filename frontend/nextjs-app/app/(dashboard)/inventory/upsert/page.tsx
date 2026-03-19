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

type UpsertInventoryEntryDto = {
  hotelId: number;
  roomTypeId: number;
  date: string; // yyyy-mm-dd
  totalUnits: number;
  availableUnits: number;
};

export default function UpsertInventoryPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { hotels, roomTypes } = useLookups();
  const [form, setForm] = React.useState<UpsertInventoryEntryDto>({
    hotelId: 0,
    roomTypeId: 0,
    date: new Date().toISOString().slice(0, 10),
    totalUnits: 10,
    availableUnits: 10,
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
      await apiFetch("/api/inventory", {
        method: "POST",
        body: JSON.stringify(form),
        auth: true,
      });
      router.push("/inventory");
    } catch (err) {
      setError(apiErrorMessage(err, t, "inventory.upsertFailed"));
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
              {t("inventory.upsertTitle")}
            </Typography>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <FormControl fullWidth>
              <InputLabel id="hotelId-label">{t("inventory.field.hotelId")}</InputLabel>
              <Select
                labelId="hotelId-label"
                label={t("inventory.field.hotelId")}
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
              <InputLabel id="roomTypeId-label">{t("inventory.field.roomTypeId")}</InputLabel>
              <Select
                labelId="roomTypeId-label"
                label={t("inventory.field.roomTypeId")}
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
              label={t("inventory.field.date")}
              type="date"
              value={form.date}
              onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label={t("inventory.field.totalUnits")}
              type="number"
              value={form.totalUnits}
              onChange={(e) =>
                setForm((s) => ({ ...s, totalUnits: Number(e.target.value) }))
              }
            />
            <TextField
              label={t("inventory.field.availableUnits")}
              type="number"
              value={form.availableUnits}
              onChange={(e) =>
                setForm((s) => ({ ...s, availableUnits: Number(e.target.value) }))
              }
            />

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="text" onClick={() => router.push("/inventory")}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? t("common.saving") : t("common.save")}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

