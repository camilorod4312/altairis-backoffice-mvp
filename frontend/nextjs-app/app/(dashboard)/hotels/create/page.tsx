"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Checkbox,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  ListItemText,
} from "@mui/material";

import { apiFetch } from "@/lib/api";
import { apiErrorMessage } from "@/lib/apiError";
import { getUser } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useLookups } from "@/lib/lookups";

type UserListItem = {
  id: number;
  email: string;
  role: string;
  hotelIds?: number[];
  isActive: boolean;
  createdUtc: string;
};

type PagedResult<T> = { page: number; pageSize: number; total: number; items: T[] };

type OwnerOption = {
  userId: number;
  email: string;
  currentHotelName?: string;
};

export default function CreateHotelPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { hotelsById } = useLookups();

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [owners, setOwners] = React.useState<OwnerOption[]>([]);

  const [form, setForm] = React.useState({
    name: "",
    city: "",
    country: "",
    addressLine1: "",
    postalCode: "",
    isActive: true,
    ownerUserIds: [] as number[],
  });

  React.useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "Admin") {
      router.replace("/hotels");
    }
  }, [router]);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadOwners() {
      try {
        setError(null);
        const url = new URL("/api/users", "http://local");
        url.searchParams.set("page", "1");
        url.searchParams.set("pageSize", "500");

        const json = await apiFetch<PagedResult<UserListItem>>(url.pathname + url.search, {
          signal: controller.signal,
          auth: true,
        });

        const ownerUsers = json.items.filter((u) => u.role === "HotelOwner");

        const options: OwnerOption[] = ownerUsers.map((u) => ({
          userId: u.id,
          email: u.email,
          currentHotelName:
            u.hotelIds && u.hotelIds.length > 0 ? hotelsById.get(u.hotelIds[0])?.name : undefined,
        }));

        setOwners(options);

      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError(apiErrorMessage(e, t, "errors.generic"));
      }
    }

    loadOwners();
    return () => controller.abort();
  }, [hotelsById, t]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        Name: form.name,
        City: form.city,
        Country: form.country,
        AddressLine1: form.addressLine1.trim() ? form.addressLine1.trim() : null,
        PostalCode: form.postalCode.trim() ? form.postalCode.trim() : null,
        IsActive: form.isActive,
        OwnerUserIds: form.ownerUserIds,
      };

      await apiFetch("/api/hotels", {
        method: "POST",
        body: JSON.stringify(payload),
        auth: true,
      });

      router.push("/hotels");
    } catch (e) {
      setError(apiErrorMessage(e, t, "hotels.createFailed"));
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
              {t("hotels.createTitle")}
            </Typography>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label={t("hotels.field.name")}
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
            />

            <TextField
              label={t("hotels.field.city")}
              value={form.city}
              onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
              required
            />

            <TextField
              label={t("hotels.field.country")}
              value={form.country}
              onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))}
              required
            />

            <TextField
              label={t("hotels.field.addressLine1")}
              value={form.addressLine1}
              onChange={(e) => setForm((s) => ({ ...s, addressLine1: e.target.value }))}
            />

            <TextField
              label={t("hotels.field.postalCode")}
              value={form.postalCode}
              onChange={(e) => setForm((s) => ({ ...s, postalCode: e.target.value }))}
            />

            <FormControl fullWidth>
              <InputLabel id="ownerUserIds-label">{t("hotels.field.owner")}</InputLabel>
              <Select
                multiple
                labelId="ownerUserIds-label"
                input={<OutlinedInput label={t("hotels.field.owner")} />}
                value={form.ownerUserIds}
                onChange={(e) => {
                  const v = e.target.value;
                  const next = Array.isArray(v) ? v.map((x) => Number(x)) : [];
                  setForm((s) => ({ ...s, ownerUserIds: next }));
                }}
                renderValue={(selected) =>
                  (selected as number[])
                    .map((id) => owners.find((o) => o.userId === id)?.email ?? String(id))
                    .join(", ")
                }
              >
                {owners.length === 0 ? (
                  <MenuItem value={0} disabled>
                    -
                  </MenuItem>
                ) : null}
                {owners.map((o) => (
                  <MenuItem key={o.userId} value={o.userId}>
                    <Checkbox checked={form.ownerUserIds.includes(o.userId)} />
                    <ListItemText
                      primary={o.email}
                      secondary={o.currentHotelName ? `(${o.currentHotelName})` : undefined}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1} alignItems="center">
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
              />
              <Typography>{t("hotels.field.isActive")}</Typography>
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="text" onClick={() => router.push("/hotels")}>
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? t("common.creating") : t("common.create")}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

