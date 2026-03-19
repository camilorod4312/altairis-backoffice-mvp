using Altairis.Application.Common;
using Altairis.Application.Dtos.Reservations;
using Altairis.Domain.Entities;
using System.Collections.Generic;

namespace Altairis.Application.IServices;

public interface IReservationService
{
    Task<PagedResult<ReservationListItemDto>> GetAsync(IReadOnlyList<int>? hotelIds, string? query, DateOnly? from, DateOnly? to, int page, int pageSize, CancellationToken ct);
    Task<Reservation> CreateAsync(CreateReservationDto request, CancellationToken ct);
    Task<ReservationDto?> GetByIdAsync(int id, CancellationToken ct);
}

