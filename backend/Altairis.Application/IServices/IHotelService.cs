using Altairis.Application.Common;
using Altairis.Application.Dtos.Hotels;
using Altairis.Domain.Entities;

namespace Altairis.Application.IServices;

public interface IHotelService
{
    Task<PagedResult<HotelListItemDto>> GetAsync(string? query, int page, int pageSize, CancellationToken ct);
    Task<Hotel> CreateAsync(CreateHotelDto request, CancellationToken ct);
    Task<HotelDto?> GetByIdAsync(int id, CancellationToken ct);
}

