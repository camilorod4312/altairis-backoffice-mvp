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
import { getUser } from "@/lib/auth";

type CreateRoomTypeDto = {
  hotelId: number;
  code: string;
  name: string;
  maxOccupancy: number;
};

export default function CreateRoomTypePage() {
  const router = useRouter();
  const { t } = useI18n();
  const { hotels } = useLookups();
  const [role, setRole] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<CreateRoomTypeDto>({
    hotelId: 0,
    code: "",
    name: "",
    maxOccupancy: 2,
  });
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const u = getUser();
    setRole(u?.role ?? null);
  }, []);

  const canCreate = role === "Admin" || role === "HotelOwner";

  React.useEffect(() => {
    if (role === "Ops") {
      setError(t("roomTypes.createFailed") ?? "Forbidden");
    }
  }, [role, t]);

  React.useEffect(() => {
    if (form.hotelId !== 0) return;
    if (hotels.length === 0) return;
    setForm((s) => ({ ...s, hotelId: hotels[0]!.id }));
  }, [form.hotelId, hotels]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/api/room-types", {
        method: "POST",
        body: JSON.stringify(form),
        auth: true,
      });
      router.push("/room-types");
    } catch (err) {
      setError(apiErrorMessage(err, t, "roomTypes.createFailed"));
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
              {t("roomTypes.createTitle")}
            </Typography>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <FormControl fullWidth>
              <InputLabel id="hotelId-label">{t("roomTypes.field.hotelId")}</InputLabel>
              <Select
                labelId="hotelId-label"
                label={t("roomTypes.field.hotelId")}
                value={form.hotelId}
                onChange={(e) =>
                  setForm((s) => ({ ...s, hotelId: Number(e.target.value) }))
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
            <TextField
              label={t("roomTypes.field.code")}
              value={form.code}
              onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
            />
            <TextField
              label={t("roomTypes.field.name")}
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
            <TextField
              label={t("roomTypes.field.maxOcc")}
              type="number"
              value={form.maxOccupancy}
              onChange={(e) =>
                setForm((s) => ({ ...s, maxOccupancy: Number(e.target.value) }))
              }
            />

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="text" onClick={() => router.push("/room-types")}>
                {t("common.cancel")}
              </Button>
                <Button type="submit" variant="contained" disabled={loading || !canCreate}>
                {loading ? t("common.creating") : t("common.create")}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

