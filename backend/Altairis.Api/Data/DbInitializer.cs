using Altairis.Domain.Entities;
using Altairis.Infrastructure.Data;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AltairisDbContext db, CancellationToken ct)
    {
        if (await db.Hotels.AnyAsync(ct))
        {
            return;
        }

        var h1 = new Hotel { Name = "Altairis Madrid Center", City = "Madrid", Country = "Spain", IsActive = true };
        var h2 = new Hotel { Name = "Altairis BCN Beach", City = "Barcelona", Country = "Spain", IsActive = true };
        db.Hotels.AddRange(h1, h2);
        await db.SaveChangesAsync(ct);

        var rt11 = new RoomType { HotelId = h1.Id, Code = "STD", Name = "Standard", MaxOccupancy = 2 };
        var rt12 = new RoomType { HotelId = h1.Id, Code = "DLX", Name = "Deluxe", MaxOccupancy = 3 };
        var rt21 = new RoomType { HotelId = h2.Id, Code = "STD", Name = "Standard", MaxOccupancy = 2 };
        db.RoomTypes.AddRange(rt11, rt12, rt21);
        await db.SaveChangesAsync(ct);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var inventory = new List<InventoryEntry>();
        foreach (var offset in Enumerable.Range(0, 14))
        {
            var date = today.AddDays(offset);
            inventory.Add(new InventoryEntry { HotelId = h1.Id, RoomTypeId = rt11.Id, Date = date, TotalUnits = 20, AvailableUnits = 18 });
            inventory.Add(new InventoryEntry { HotelId = h1.Id, RoomTypeId = rt12.Id, Date = date, TotalUnits = 10, AvailableUnits = 9 });
            inventory.Add(new InventoryEntry { HotelId = h2.Id, RoomTypeId = rt21.Id, Date = date, TotalUnits = 15, AvailableUnits = 15 });
        }
        db.InventoryEntries.AddRange(inventory);
        await db.SaveChangesAsync(ct);

        db.Reservations.Add(new Reservation
        {
            Reference = "ALT-0001",
            HotelId = h1.Id,
            RoomTypeId = rt11.Id,
            GuestName = "Demo Guest",
            GuestEmail = "guest@example.com",
            CheckIn = today.AddDays(2),
            CheckOut = today.AddDays(4),
            Units = 1,
            Status = "Confirmed"
        });
        await db.SaveChangesAsync(ct);

        var users = new List<User>
        {
            new()
            {
                Email = "admin@altairis.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Role = "Admin",
                HotelId = null,
                IsActive = true
            },
            new()
            {
                Email = "owner@altairis.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Owner123!"),
                Role = "HotelOwner",
                HotelId = h1.Id,
                IsActive = true
            },
            new()
            {
                Email = "owner2@altairis.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Owner2123!"),
                Role = "HotelOwner",
                HotelId = h2.Id,
                IsActive = true
            },
            new()
            {
                Email = "ops@altairis.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ops123!"),
                Role = "Ops",
                HotelId = null,
                IsActive = true
            }
        };
        db.Users.AddRange(users);
        await db.SaveChangesAsync(ct);
    }
}

