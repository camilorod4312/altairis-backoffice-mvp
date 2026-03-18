using Altairis.Application.Dtos.Hotels;
using Altairis.Application.Repositories;
using Altairis.Domain.Entities;
using Altairis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Infrastructure.Repositories;

internal sealed class HotelRepository : IHotelRepository
{
    private readonly AltairisDbContext _db;

    public HotelRepository(AltairisDbContext db)
    {
        _db = db;
    }

    public async Task<(int total, List<HotelListItemDto> items)> ListAsync(string? query, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.Hotels.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim();
            q = q.Where(h => h.Name.Contains(term) || h.City.Contains(term) || h.Country.Contains(term));
        }

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderBy(h => h.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(h => new HotelListItemDto(h.Id, h.Name, h.City, h.Country, h.IsActive))
            .ToListAsync(ct);

        return (total, items);
    }

    public Task<HotelDto?> GetByIdAsync(int id, CancellationToken ct) =>
        _db.Hotels
            .AsNoTracking()
            .Where(h => h.Id == id)
            .Select(h => new HotelDto(
                h.Id,
                h.Name,
                h.City,
                h.Country,
                h.AddressLine1,
                h.PostalCode,
                h.IsActive,
                h.CreatedUtc))
            .FirstOrDefaultAsync(ct);

    public Task AddAsync(Hotel hotel, CancellationToken ct)
    {
        _db.Hotels.Add(hotel);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}

