using Altairis.Application.Dtos.RoomTypes;
using Altairis.Application.Repositories;
using Altairis.Domain.Entities;
using Altairis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Infrastructure.Repositories;

internal sealed class RoomTypeRepository : IRoomTypeRepository
{
    private readonly AltairisDbContext _db;

    public RoomTypeRepository(AltairisDbContext db)
    {
        _db = db;
    }

    public async Task<(int total, List<RoomTypeListItemDto> items)> ListAsync(int? hotelId, string? query, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.RoomTypes.AsNoTracking();
        if (hotelId is not null)
        {
            q = q.Where(rt => rt.HotelId == hotelId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim();
            q = q.Where(rt => rt.Code.Contains(term) || rt.Name.Contains(term));
        }

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderBy(rt => rt.HotelId)
            .ThenBy(rt => rt.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(rt => new RoomTypeListItemDto(rt.Id, rt.HotelId, rt.Code, rt.Name, rt.MaxOccupancy))
            .ToListAsync(ct);

        return (total, items);
    }

    public Task<RoomTypeDto?> GetByIdAsync(int id, CancellationToken ct) =>
        _db.RoomTypes
            .AsNoTracking()
            .Where(rt => rt.Id == id)
            .Select(rt => new RoomTypeDto(rt.Id, rt.HotelId, rt.Code, rt.Name, rt.MaxOccupancy))
            .FirstOrDefaultAsync(ct);

    public Task AddAsync(RoomType roomType, CancellationToken ct)
    {
        _db.RoomTypes.Add(roomType);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}

