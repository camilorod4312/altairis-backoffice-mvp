"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Checkbox,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Snackbar,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { apiErrorMessage } from "@/lib/apiError";
import { getUser } from "@/lib/auth";
import { format, useI18n } from "@/lib/i18n";
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

type UpsertUserDto = {
  email: string;
  role: string;
  hotelIds?: number[] | null;
  password?: string | null;
  isActive?: boolean | null;
};

export default function UsersPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { hotelsById, hotels } = useLookups();

  const [query, setQuery] = React.useState("");
  const [data, setData] = React.useState<PagedResult<UserListItem> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form, setForm] = React.useState<UpsertUserDto>({
    email: "",
    role: "Ops",
    hotelIds: [],
    password: "",
    isActive: true,
  });
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [assignmentsToastOpen, setAssignmentsToastOpen] = React.useState(false);

  React.useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "Admin") {
      router.replace("/hotels");
    }
  }, [router]);

  React.useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setError(null);
        const url = new URL("/api/users", "http://local");
        url.searchParams.set("page", "1");
        url.searchParams.set("pageSize", "50");
        if (query.trim()) url.searchParams.set("q", query.trim());
        const json = await apiFetch<PagedResult<UserListItem>>(url.pathname + url.search, {
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

  function openCreate() {
    setEditingId(null);
    setForm({
      email: "",
      role: "Ops",
      hotelIds: [],
      password: "",
      isActive: true,
    });
    setSaveError(null);
    setAssignmentsToastOpen(false);
    setOpen(true);
  }

  function openEdit(u: UserListItem) {
    setEditingId(u.id);
    setForm({
      email: u.email,
      role: u.role,
      hotelIds: u.hotelIds ?? [],
      password: "",
      isActive: u.isActive,
    });
    setSaveError(null);
    setAssignmentsToastOpen(false);
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: UpsertUserDto = {
        email: form.email,
        role: form.role,
        hotelIds:
          form.role === "HotelOwner" || form.role === "Ops" ? (form.hotelIds ?? []) : null,
        password: form.password?.trim() ? form.password : null,
        isActive: form.isActive ?? true,
      };

      if (editingId == null) {
        await apiFetch("/api/users", {
          method: "POST",
          body: JSON.stringify(payload),
          auth: true,
        });
      } else {
        await apiFetch(`/api/users/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
          auth: true,
        });
      }

      setOpen(false);
      setAssignmentsToastOpen(true);

      // refresh list
      const url = new URL("/api/users", "http://local");
      url.searchParams.set("page", "1");
      url.searchParams.set("pageSize", "50");
      if (query.trim()) url.searchParams.set("q", query.trim());
      const json = await apiFetch<PagedResult<UserListItem>>(url.pathname + url.search, {
        auth: true,
      });
      setData(json);
    } catch (e) {
      setSaveError(apiErrorMessage(e, t, "users.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  const hotelLabel =
    form.role === "HotelOwner" || form.role === "Ops"
      ? (form.hotelIds ?? [])
          .map((id) => hotelsById.get(id)?.name ?? String(id))
          .join(", ") || "-"
      : "-";

  const roleLabel = React.useCallback(
    (role: string) => t(`role.${role}`),
    [t],
  );

  return (
    <Box sx={{ py: 1 }}>
      <Container maxWidth="lg">
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            {t("users.title")}
          </Typography>

          <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                <TextField
                  label={t("common.search")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("users.searchPlaceholder")}
                  size="small"
                  sx={{ maxWidth: 420, width: "100%" }}
                />
                <Button variant="contained" onClick={openCreate}>
                  {t("common.create")}
                </Button>
              </Stack>

              {error ? <Typography color="error">{error}</Typography> : null}

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("users.col.email")}</TableCell>
                    <TableCell>{t("users.col.role")}</TableCell>
                    <TableCell>{t("users.col.hotel")}</TableCell>
                    <TableCell>{t("users.col.active")}</TableCell>
                    <TableCell>{t("users.col.created")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.items ?? []).map((u) => (
                    <TableRow key={u.id} hover onClick={() => openEdit(u)} sx={{ cursor: "pointer" }}>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{roleLabel(u.role)}</TableCell>
                      <TableCell>
                        {u.role === "HotelOwner" || u.role === "Ops"
                          ? (u.hotelIds ?? [])
                              .map((id) => hotelsById.get(id)?.name ?? "-")
                              .join(", ") || "-"
                          : "-"}
                      </TableCell>
                      <TableCell>{u.isActive ? t("common.active") : t("common.inactive")}</TableCell>
                      <TableCell>{new Date(u.createdUtc).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data ? (
                <Typography variant="body2" color="text.secondary">
                  {format(t("common.showing"), { count: data.items.length, total: data.total })}
                </Typography>
              ) : null}
            </Stack>
          </Paper>
        </Stack>
      </Container>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingId == null ? t("users.createTitle") : t("users.editTitle")}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {saveError ? <Alert severity="error">{saveError}</Alert> : null}

            <TextField
              label={t("users.field.email")}
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              autoComplete="username"
            />

            <FormControl fullWidth>
              <InputLabel id="role-label">{t("users.field.role")}</InputLabel>
              <Select
                labelId="role-label"
                label={t("users.field.role")}
                value={form.role}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    role: String(e.target.value),
                    hotelIds: [],
                  }))
                }
              >
                <MenuItem value="Admin">{roleLabel("Admin")}</MenuItem>
                <MenuItem value="HotelOwner">{roleLabel("HotelOwner")}</MenuItem>
                <MenuItem value="Ops">{roleLabel("Ops")}</MenuItem>
              </Select>
            </FormControl>

            {form.role === "HotelOwner" ? (
              <FormControl fullWidth>
                <InputLabel id="hotel-label">{t("users.field.hotel")}</InputLabel>
                <Select
                  labelId="hotel-label"
                  label={t("users.field.hotel")}
                  multiple
                  value={form.hotelIds ?? []}
                  input={<OutlinedInput label={t("users.field.hotel")} />}
                  onChange={(e) => {
                    const v = e.target.value;
                    const next = Array.isArray(v) ? v.map((x) => Number(x)) : [];
                    setForm((s) => ({ ...s, hotelIds: next }));
                  }}
                >
                  {hotels.map((h) => (
                    <MenuItem key={h.id} value={h.id}>
                      <Checkbox checked={(form.hotelIds ?? []).includes(h.id)} />
                      {h.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : form.role === "Ops" ? (
              <FormControl fullWidth>
                <InputLabel id="ops-hotel-label">{t("users.field.hotel")}</InputLabel>
                <Select
                  labelId="ops-hotel-label"
                  label={t("users.field.hotel")}
                  value={(form.hotelIds ?? [])[0] ?? ""}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, hotelIds: [Number(e.target.value)] }))
                  }
                >
                  {hotels.length === 0 ? (
                    <MenuItem value="" disabled>
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
            ) : null}

            {(form.role === "HotelOwner" || form.role === "Ops") ? (
              <Typography variant="body2" color="text.secondary">
                {hotelLabel}
              </Typography>
            ) : null}

            <TextField
              label={t("users.field.password")}
              type="password"
              value={form.password ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              autoComplete="new-password"
            />

            <Stack direction="row" spacing={1} alignItems="center">
              <Switch
                checked={Boolean(form.isActive)}
                onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
              />
              <Typography>{t("users.field.isActive")}</Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
          <Button
            variant="contained"
            onClick={save}
            disabled={saving || (form.role === "Ops" && (form.hotelIds ?? []).length !== 1)}
          >
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={assignmentsToastOpen}
        autoHideDuration={6000}
        onClose={() => setAssignmentsToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" sx={{ width: "100%" }}>
          <Typography variant="body2" fontWeight={700}>
            {t("users.assignmentsInfoTitle")}
          </Typography>
          <Typography variant="body2">{t("users.assignmentsInfoBody")}</Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
}

