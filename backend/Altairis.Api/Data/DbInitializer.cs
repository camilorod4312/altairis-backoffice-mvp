using Altairis.Domain.Entities;
using Altairis.Infrastructure.Data;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AltairisDbContext db, CancellationToken ct)
    {
        // Seed is idempotent-ish: only insert demo data if missing/insufficient.

        if (!await db.Hotels.AnyAsync(ct))
        {
            var h1 = new Hotel { Name = "Altairis Madrid Center", City = "Madrid", Country = "Spain", IsActive = true };
            var h2 = new Hotel { Name = "Altairis BCN Beach", City = "Barcelona", Country = "Spain", IsActive = true };
            db.Hotels.AddRange(h1, h2);
            await db.SaveChangesAsync(ct);
        }

        var hotels = await db.Hotels.AsNoTracking().OrderBy(h => h.Id).ToListAsync(ct);
        var h1Id = hotels.ElementAtOrDefault(0)?.Id ?? 1;
        var h2Id = hotels.ElementAtOrDefault(1)?.Id ?? h1Id;

        if (!await db.RoomTypes.AnyAsync(ct))
        {
            var rt11 = new RoomType { HotelId = h1Id, Code = "STD", Name = "Standard", MaxOccupancy = 2 };
            var rt12 = new RoomType { HotelId = h1Id, Code = "DLX", Name = "Deluxe", MaxOccupancy = 3 };
            var rt13 = new RoomType { HotelId = h1Id, Code = "FAM", Name = "Family", MaxOccupancy = 4 };
            var rt21 = new RoomType { HotelId = h2Id, Code = "STD", Name = "Standard", MaxOccupancy = 2 };
            var rt22 = new RoomType { HotelId = h2Id, Code = "SEA", Name = "Sea View", MaxOccupancy = 3 };
            db.RoomTypes.AddRange(rt11, rt12, rt13, rt21, rt22);
            await db.SaveChangesAsync(ct);
        }

        var roomTypes = await db.RoomTypes.AsNoTracking().OrderBy(rt => rt.Id).ToListAsync(ct);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Extend inventory for demo (30 days) with varying availability.
        var inventoryCount = await db.InventoryEntries.CountAsync(ct);
        if (inventoryCount < 200)
        {
            var rng = new Random(123);

            var invFrom = today.AddDays(-10);
            var invTo = today.AddDays(40);
            var existingInvKeys = await db.InventoryEntries
                .AsNoTracking()
                .Where(e => e.Date >= invFrom && e.Date <= invTo)
                .Select(e => new { e.HotelId, e.RoomTypeId, e.Date })
                .ToListAsync(ct);

            var existingInv = new HashSet<(int hotelId, int roomTypeId, DateOnly date)>(
                existingInvKeys.Select(x => (x.HotelId, x.RoomTypeId, x.Date)));

            var inventory = new List<InventoryEntry>();
            foreach (var offset in Enumerable.Range(0, 30))
            {
                var date = today.AddDays(offset);
                foreach (var rt in roomTypes)
                {
                    if (existingInv.Contains((rt.HotelId, rt.Id, date))) continue;

                    var baseTotal = rt.MaxOccupancy switch
                    {
                        >= 4 => 8,
                        3 => 12,
                        _ => 20
                    };

                    var total = baseTotal + rng.Next(-2, 3);
                    if (total < 1) total = 1;

                    // Create some "low availability" spikes.
                    var spike = (offset % 7 == 5) ? rng.Next(6, 12) : rng.Next(0, 6);
                    var available = Math.Max(0, total - spike);

                    inventory.Add(new InventoryEntry
                    {
                        HotelId = rt.HotelId,
                        RoomTypeId = rt.Id,
                        Date = date,
                        TotalUnits = total,
                        AvailableUnits = available
                    });
                }
            }

            db.InventoryEntries.AddRange(inventory);
            await db.SaveChangesAsync(ct);
        }

        // Add a baseline reservation if none exist.
        if (!await db.Reservations.AnyAsync(ct))
        {
            var anyRt = roomTypes.FirstOrDefault();
            if (anyRt is not null)
            {
                db.Reservations.Add(new Reservation
                {
                    Reference = "ALT-0001",
                    HotelId = anyRt.HotelId,
                    RoomTypeId = anyRt.Id,
                    GuestName = "Demo Guest",
                    GuestEmail = "guest@example.com",
                    CheckIn = today.AddDays(2),
                    CheckOut = today.AddDays(4),
                    Units = 1,
                    Status = "Confirmed"
                });
                await db.SaveChangesAsync(ct);
            }
        }

        // Add many reservations for dashboard/demo (mix statuses, dates).
        var reservationCount = await db.Reservations.CountAsync(ct);
        if (reservationCount < 80 && roomTypes.Count > 0)
        {
            var rng = new Random(456);
            var statuses = new[] { "Confirmed", "Pending", "Cancelled" };
            var reservations = new List<Reservation>();

            var existingRefs = await db.Reservations
                .AsNoTracking()
                .Where(r => r.Reference.StartsWith("ALT-2"))
                .Select(r => r.Reference)
                .ToListAsync(ct);

            var existingRefSet = new HashSet<string>(existingRefs);

            for (var i = 0; i < 120; i++)
            {
                var rt = roomTypes[rng.Next(roomTypes.Count)];
                var startOffset = rng.Next(-3, 15);
                var length = rng.Next(1, 6);
                var checkIn = today.AddDays(startOffset);
                var checkOut = today.AddDays(startOffset + length);
                var status = statuses[rng.Next(statuses.Length)];
                var reference = $"ALT-{(2000 + i):0000}";
                if (existingRefSet.Contains(reference)) continue;

                reservations.Add(new Reservation
                {
                    Reference = reference,
                    HotelId = rt.HotelId,
                    RoomTypeId = rt.Id,
                    GuestName = $"Guest {i + 1}",
                    GuestEmail = $"guest{i + 1}@example.com",
                    CheckIn = checkIn,
                    CheckOut = checkOut,
                    Units = rng.Next(1, 3),
                    Status = status,
                    CreatedUtc = DateTime.UtcNow.AddDays(rng.Next(-10, 1)).AddMinutes(-rng.Next(0, 6000))
                });
            }

            db.Reservations.AddRange(reservations);
            await db.SaveChangesAsync(ct);
        }

        var seededUsers = new[]
        {
            new { Email = "admin@altairis.local", Password = "Admin123!", Role = Altairis.Domain.Entities.UserRole.Admin, HotelId = (int?)null },
            new { Email = "owner@altairis.local", Password = "Owner123!", Role = Altairis.Domain.Entities.UserRole.HotelOwner, HotelId = (int?)h1Id },
            new { Email = "owner2@altairis.local", Password = "Owner2123!", Role = Altairis.Domain.Entities.UserRole.HotelOwner, HotelId = (int?)h2Id },
            new { Email = "ops@altairis.local", Password = "Ops123!", Role = Altairis.Domain.Entities.UserRole.Ops, HotelId = (int?)h1Id },
        };

        foreach (var su in seededUsers)
        {
            var existing = await db.Users.FirstOrDefaultAsync(u => u.Email == su.Email, ct);
            if (existing is null)
            {
                db.Users.Add(new User
                {
                    Email = su.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(su.Password),
                    Role = su.Role,
                    HotelId = su.HotelId,
                    IsActive = true
                });
            }
            else
            {
                existing.Role = su.Role;
                existing.HotelId = su.HotelId;
                existing.IsActive = true;
                existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword(su.Password);
            }
        }

        await db.SaveChangesAsync(ct);

        // Seed tenant scope assignments for the new UserHotelAssignments join table.
        // Owner can have multiple hotels; Ops should have exactly one hotel.
        {
            async Task SetAssignments(int userId, IReadOnlyList<int> hotelIds)
            {
                var existing = await db.UserHotelAssignments.Where(a => a.UserId == userId).ToListAsync(ct);
                if (existing.Count > 0) db.UserHotelAssignments.RemoveRange(existing);

                db.UserHotelAssignments.AddRange(hotelIds.Distinct().Select(id => new UserHotelAssignment
                {
                    UserId = userId,
                    HotelId = id
                }));

                await db.SaveChangesAsync(ct);
            }

            var owner1User = await db.Users.FirstOrDefaultAsync(u => u.Email == "owner@altairis.local", ct);
            var owner2User = await db.Users.FirstOrDefaultAsync(u => u.Email == "owner2@altairis.local", ct);
            var opsUser = await db.Users.FirstOrDefaultAsync(u => u.Email == "ops@altairis.local", ct);

            if (owner1User is not null) await SetAssignments(owner1User.Id, new[] { h1Id, h2Id });
            if (owner2User is not null) await SetAssignments(owner2User.Id, new[] { h2Id });
            if (opsUser is not null) await SetAssignments(opsUser.Id, new[] { h1Id });
        }
    }
}

