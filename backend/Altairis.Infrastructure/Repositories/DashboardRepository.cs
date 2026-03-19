using Altairis.Application.Dtos.Dashboard;
using Altairis.Application.Repositories;
using Altairis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Infrastructure.Repositories;

internal sealed class DashboardRepository : IDashboardRepository
{
    private readonly AltairisDbContext _db;

    public DashboardRepository(AltairisDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardDto> GetDashboardAsync(
        IReadOnlyList<int>? hotelIds,
        DateOnly date,
        CancellationToken ct)
    {
        var reservations = _db.Reservations.AsNoTracking();
        var inventory = _db.InventoryEntries.AsNoTracking();

        if (hotelIds is not null)
        {
            reservations = reservations.Where(r => hotelIds.Contains(r.HotelId));
            inventory = inventory.Where(e => hotelIds.Contains(e.HotelId));
        }

        var activeOnDate = reservations.Where(r => r.CheckIn <= date && r.CheckOut >= date);

        var arrivals = await reservations
            .Where(r => r.CheckIn == date)
            .CountAsync(ct);

        var departures = await reservations
            .Where(r => r.CheckOut == date)
            .CountAsync(ct);

        var statusGroups = await activeOnDate
            .GroupBy(r => r.Status)
            .Select(g => new StatusCountDto(g.Key, g.Count()))
            .ToListAsync(ct);

        var totalBookings = statusGroups.Sum(s => s.Count);

        var occupancyRaw = await inventory
            .Where(e => e.Date == date)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                TotalUnits = g.Sum(e => e.TotalUnits),
                AvailableUnits = g.Sum(e => e.AvailableUnits)
            })
            .FirstOrDefaultAsync(ct);

        var occupancy = occupancyRaw is not null
            ? new OccupancyDto(occupancyRaw.TotalUnits, occupancyRaw.AvailableUnits)
            : new OccupancyDto(0, 0);

        var recentBookings = await activeOnDate
            .OrderByDescending(r => r.CreatedUtc)
            .Take(6)
            .Select(r => new RecentBookingDto(r.Id, r.Reference, r.HotelId, r.GuestName))
            .ToListAsync(ct);

        return new DashboardDto(
            arrivals,
            departures,
            totalBookings,
            statusGroups,
            occupancy,
            recentBookings);
    }
}
