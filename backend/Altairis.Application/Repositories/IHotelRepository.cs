using Altairis.Application.Dtos.Hotels;
using Altairis.Domain.Entities;
using System.Collections.Generic;

namespace Altairis.Application.Repositories;

public interface IHotelRepository
{
    Task<(int total, List<HotelListItemDto> items)> ListAsync(IReadOnlyList<int>? hotelIds, string? query, int page, int pageSize, CancellationToken ct);
    Task<HotelDto?> GetByIdAsync(int id, CancellationToken ct);
    Task AddAsync(Hotel hotel, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

