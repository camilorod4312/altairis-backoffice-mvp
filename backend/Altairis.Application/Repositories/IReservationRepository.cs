using Altairis.Application.Dtos.Reservations;
using Altairis.Domain.Entities;

namespace Altairis.Application.Repositories;

public interface IReservationRepository
{
    Task<(int total, List<ReservationListItemDto> items)> ListAsync(IReadOnlyList<int>? hotelIds, string? query, DateOnly? from, DateOnly? to, int page, int pageSize, CancellationToken ct);
    Task<ReservationDto?> GetByIdAsync(int id, CancellationToken ct);
    Task AddAsync(Reservation reservation, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

