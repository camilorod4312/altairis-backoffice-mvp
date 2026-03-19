"use client";

import Link from "next/link";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const router = useRouter();
  const { t } = useI18n();
  React.useEffect(() => {
    if (getToken()) router.replace("/hotels");
    else router.replace("/login");
  }, [router]);

  return (
    <Box sx={{ minHeight: "100vh", py: 6 }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography variant="h4" fontWeight={700}>
            {t("app.title")}
          </Typography>
          <Typography color="text.secondary">
            MUI-only UI scaffold. Next step: add the dashboard shell + pages for
            Hotels, Room Types, Inventory, and Reservations.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button component={Link} href="/hotels" variant="contained">
              {t("nav.hotels")}
            </Button>
            <Button component={Link} href="/reservations" variant="outlined">
              {t("nav.reservations")}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
