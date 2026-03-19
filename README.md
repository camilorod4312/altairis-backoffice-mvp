# Altairis Booking Backoffice (MVP)

Fullstack hotel management backoffice for **Viajes Altairis**.

| Layer | Stack |
|-------|-------|
| Backend | .NET 9 / ASP.NET Core Web API, EF Core 9, JWT auth, BCrypt |
| Frontend | Next.js 16 (App Router), React 19, MUI v7, TypeScript |
| Database | SQL Server 2022 |
| Infra | Docker Compose (all three services) |

## Run locally (one command)

1. Copy `.env.example` to `.env` (the defaults work out of the box for local dev).
2. From the repository root:

```bash
docker compose up -d --build
```

3. Wait ~15 seconds for SQL Server to initialize, then open:
   - **Frontend:** http://localhost:3000
   - **API health:** http://localhost:5000/health
   - **OpenAPI spec:** http://localhost:5000/openapi/v1.json

The backend automatically runs EF Core migrations and seeds demo data on first startup.

## Demo accounts

| Role | Email | Password | Scope |
|------|-------|----------|-------|
| Admin | `admin@altairis.local` | `Admin123!` | All hotels |
| HotelOwner | `owner@altairis.local` | `Owner123!` | Madrid + Barcelona |
| HotelOwner (2) | `owner2@altairis.local` | `Owner2123!` | Barcelona only |
| Ops | `ops@altairis.local` | `Ops123!` | Madrid only |

## Features

- **Dashboard** -- arrivals, departures, occupancy, status breakdown, and recent bookings for a selected date. Aggregates are computed server-side via a dedicated `/api/dashboard` endpoint.
- **Hotels** -- list, search, create (Admin only, with owner assignment).
- **Room types** -- list, search, create (Admin / HotelOwner).
- **Inventory** -- table view + heatmap with date-range filtering, upsert.
- **Reservations** -- list, search, create.
- **Users** -- list, create, edit (Admin only), role and hotel assignment.
- **i18n** -- English and Spanish, switchable from the sidebar.
- **Responsive UI** -- MUI layout with collapsible sidebar drawer.

## Architecture

```
backend/
  Altairis.Domain/          Entities (Hotel, RoomType, InventoryEntry, Reservation, User)
  Altairis.Application/     Interfaces, DTOs, services (no infrastructure deps)
  Altairis.Infrastructure/  EF Core DbContext, repository implementations, migrations
  Altairis.Api/             Controllers, auth, seeder, Program.cs

frontend/nextjs-app/
  app/(dashboard)/          Dashboard, hotels, room-types, inventory, reservations, users
  app/login/                Login page
  components/               AppShell (sidebar, nav, language switcher)
  lib/                      api, auth, i18n, lookups, env, apiError
```

## API endpoints

All authenticated endpoints require a `Bearer` token obtained from `/api/auth/login`.

| Method | Route | Roles | Description |
|--------|-------|-------|-------------|
| GET | `/health` | -- | Health check |
| POST | `/api/auth/login` | -- | Authenticate (returns JWT) |
| GET | `/api/dashboard` | All | Dashboard aggregates for a date (`?date=&hotelId=`) |
| GET | `/api/hotels` | All | List hotels (paginated, searchable) |
| GET | `/api/hotels/{id}` | All | Get hotel by ID |
| POST | `/api/hotels` | Admin | Create hotel |
| GET | `/api/room-types` | All | List room types (paginated, searchable) |
| GET | `/api/room-types/{id}` | All | Get room type by ID |
| POST | `/api/room-types` | Admin, HotelOwner | Create room type |
| GET | `/api/inventory` | All | List inventory (paginated, filterable by date range) |
| POST | `/api/inventory` | All | Upsert inventory entry |
| GET | `/api/reservations` | All | List reservations (paginated, searchable, filterable) |
| GET | `/api/reservations/{id}` | All | Get reservation by ID |
| POST | `/api/reservations` | All | Create reservation |
| GET | `/api/users` | Admin | List users |
| GET | `/api/users/{id}` | Admin | Get user by ID |
| POST | `/api/users` | Admin | Create user |
| PUT | `/api/users/{id}` | Admin | Update user |

"All" = Admin, HotelOwner, Ops (each scoped to their allowed hotels).

## Tenant scoping

- **Admin** -- sees all hotels and data, no restrictions.
- **HotelOwner** -- assigned to one or more hotels via `UserHotelAssignment`; sees only data for those hotels.
- **Ops** -- assigned to exactly one hotel; sees only that hotel's data.

Scoping is enforced at the API layer via JWT `hotelIds` claim and the `HotelScope` utility. The frontend adapts UI visibility by role (e.g., only Admin sees the create-hotel button).

## Configuration

The repo includes `.env.example` with demo-ready defaults. For production, update at least:

| Variable | Purpose |
|----------|---------|
| `MSSQL_SA_PASSWORD` | SQL Server SA password |
| `JWT_SIGNING_KEY` | JWT HMAC signing key |
| `NEXT_PUBLIC_API_URL` | API base URL for the frontend |
