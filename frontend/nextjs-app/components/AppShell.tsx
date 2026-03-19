"use client";

import * as React from "react";
import Link from "next/link";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HotelIcon from "@mui/icons-material/Hotel";
import BedIcon from "@mui/icons-material/Bed";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LogoutIcon from "@mui/icons-material/Logout";
import LanguageIcon from "@mui/icons-material/Language";
import PeopleIcon from "@mui/icons-material/People";
import DashboardIcon from "@mui/icons-material/Dashboard";

import { getUser, signOut } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

const drawerWidth = 260;

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, setLang, t } = useI18n();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [langAnchorEl, setLangAnchorEl] = React.useState<null | HTMLElement>(null);
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const u = getUser();
    setUserEmail(u?.email ?? null);
    setRole(u?.role ?? null);
  }, []);

  const navItems = React.useMemo(
    () => {
      const items = [
        { href: "/dashboard", label: t("nav.dashboard"), icon: <DashboardIcon /> },
        { href: "/hotels", label: t("nav.hotels"), icon: <HotelIcon /> },
        { href: "/room-types", label: t("nav.roomTypes"), icon: <BedIcon /> },
        { href: "/inventory", label: t("nav.inventory"), icon: <Inventory2Icon /> },
        { href: "/reservations", label: t("nav.reservations"), icon: <ReceiptLongIcon /> },
      ];
      if (role === "Admin") {
        items.push({ href: "/users", label: t("nav.users"), icon: <PeopleIcon /> });
      }
      return items;
    },
    [role, t],
  );

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Toolbar />
      <List sx={{ px: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={pathname === item.href}
            sx={{ borderRadius: 2, my: 0.5 }}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flex: 1 }} />
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {userEmail ?? t("auth.notSignedIn")}
        </Typography>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          sx={{ mt: 1 }}
          onClick={() => {
            signOut();
            router.push("/login");
          }}
        >
          {t("auth.signOut")}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <Box
                    component="img"
                    src="/logo.svg"
                    alt="Altairis logo"
                    sx={{ width: 36, height: 36 }}
                />
                <Box>
                    <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
                        Altairis
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.1}>
                        {t("app.subtitle")}
                    </Typography>
                </Box>
            </Box>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
            aria-label="open navigation"
          >
            <MenuIcon />
          </IconButton>
            <Button
            sx={{ ml: "auto", display: "flex", alignItems: "center" }}
            size="small"
            variant="outlined"
            startIcon={<LanguageIcon />}
            onClick={(e) => setLangAnchorEl(e.currentTarget)}
            aria-label="change language"
          >
            {lang.toUpperCase()}
          </Button>
          <Menu
            anchorEl={langAnchorEl}
            open={Boolean(langAnchorEl)}
            onClose={() => setLangAnchorEl(null)}
          >
            <MenuItem
              selected={lang === "en"}
              onClick={() => {
                setLang("en");
                setLangAnchorEl(null);
              }}
            >
              {t("lang.english")}
            </MenuItem>
            <MenuItem
              selected={lang === "es"}
              onClick={() => {
                setLang("es");
                setLangAnchorEl(null);
              }}
            >
              {t("lang.spanish")}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          pt: 9,
          pb: 4,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

