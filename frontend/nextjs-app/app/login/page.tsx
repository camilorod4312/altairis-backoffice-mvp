"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { apiFetch } from "@/lib/api";
import { apiErrorMessage } from "@/lib/apiError";
import { setToken, setUser } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

type LoginResponse = {
  accessToken: string;
  user: { id: number; email: string; role: string; hotelId?: number | null };
};

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = React.useState("admin@altairis.local");
  const [password, setPassword] = React.useState("Admin123!");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(res.accessToken);
      setUser(res.user);
      router.push("/dashboard");
    } catch (err) {
      setError(apiErrorMessage(err, t, "auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 6 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2} component="form" onSubmit={submit}>
            <Typography variant="h5" fontWeight={700}>
              {t("auth.signIn")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("auth.useSeeded")}
            </Typography>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
            <TextField
              label={t("auth.password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? t("auth.signingIn") : t("auth.signIn")}
            </Button>

            <Alert severity="info">
              {t("auth.demoUsers")} <br />
              admin@altairis.local / Admin123! <br />
              owner@altairis.local / Owner123! <br />
              owner2@altairis.local / Owner2123! <br />
              ops@altairis.local / Ops123!
            </Alert>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

