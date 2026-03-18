using Altairis.Application.Dtos.Hotels;
using Altairis.Domain.Entities;

namespace Altairis.Application.Repositories;

public interface IHotelRepository
{
    Task<(int total, List<HotelListItemDto> items)> ListAsync(string? query, int page, int pageSize, CancellationToken ct);
    Task<HotelDto?> GetByIdAsync(int id, CancellationToken ct);
    Task AddAsync(Hotel hotel, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

