using Altairis.Application.Dtos.Inventory;
using Altairis.Application.Repositories;
using Altairis.Domain.Entities;
using Altairis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Infrastructure.Repositories;

internal sealed class InventoryRepository : IInventoryRepository
{
    private readonly AltairisDbContext _db;

    public InventoryRepository(AltairisDbContext db)
    {
        _db = db;
    }

    public async Task<(int total, List<InventoryEntryDto> items)> ListAsync(
        int? hotelId,
        int? roomTypeId,
        DateOnly? from,
        DateOnly? to,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        var q = _db.InventoryEntries.AsNoTracking();

        if (hotelId is not null)
        {
            q = q.Where(e => e.HotelId == hotelId.Value);
        }

        if (roomTypeId is not null)
        {
            q = q.Where(e => e.RoomTypeId == roomTypeId.Value);
        }

        if (from is not null)
        {
            q = q.Where(e => e.Date >= from.Value);
        }

        if (to is not null)
        {
            q = q.Where(e => e.Date <= to.Value);
        }

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderBy(e => e.Date)
            .ThenBy(e => e.HotelId)
            .ThenBy(e => e.RoomTypeId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new InventoryEntryDto(e.Id, e.HotelId, e.RoomTypeId, e.Date, e.TotalUnits, e.AvailableUnits))
            .ToListAsync(ct);

        return (total, items);
    }

    public Task<InventoryEntry?> FindAsync(int hotelId, int roomTypeId, DateOnly date, CancellationToken ct) =>
        _db.InventoryEntries.FirstOrDefaultAsync(e => e.HotelId == hotelId && e.RoomTypeId == roomTypeId && e.Date == date, ct);

    public Task AddAsync(InventoryEntry entry, CancellationToken ct)
    {
        _db.InventoryEntries.Add(entry);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}

