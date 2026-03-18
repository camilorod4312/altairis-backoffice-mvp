using Altairis.Application.Dtos.Reservations;
using Altairis.Application.Repositories;
using Altairis.Domain.Entities;
using Altairis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Infrastructure.Repositories;

internal sealed class ReservationRepository : IReservationRepository
{
    private readonly AltairisDbContext _db;

    public ReservationRepository(AltairisDbContext db)
    {
        _db = db;
    }

    public async Task<(int total, List<ReservationListItemDto> items)> ListAsync(
        int? hotelId,
        string? query,
        DateOnly? from,
        DateOnly? to,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        var q = _db.Reservations.AsNoTracking();

        if (hotelId is not null)
        {
            q = q.Where(r => r.HotelId == hotelId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim();
            q = q.Where(r => r.Reference.Contains(term) || r.GuestName.Contains(term));
        }

        if (from is not null)
        {
            q = q.Where(r => r.CheckIn >= from.Value);
        }

        if (to is not null)
        {
            q = q.Where(r => r.CheckIn <= to.Value);
        }

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(r => r.CreatedUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReservationListItemDto(
                r.Id,
                r.Reference,
                r.HotelId,
                r.RoomTypeId,
                r.GuestName,
                r.CheckIn,
                r.CheckOut,
                r.Units,
                r.Status,
                r.CreatedUtc))
            .ToListAsync(ct);

        return (total, items);
    }

    public Task<ReservationDto?> GetByIdAsync(int id, CancellationToken ct) =>
        _db.Reservations
            .AsNoTracking()
            .Where(r => r.Id == id)
            .Select(r => new ReservationDto(
                r.Id,
                r.Reference,
                r.HotelId,
                r.RoomTypeId,
                r.GuestName,
                r.GuestEmail,
                r.CheckIn,
                r.CheckOut,
                r.Units,
                r.Status,
                r.CreatedUtc))
            .FirstOrDefaultAsync(ct);

    public Task AddAsync(Reservation reservation, CancellationToken ct)
    {
        _db.Reservations.Add(reservation);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}

