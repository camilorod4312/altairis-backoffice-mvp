using Altairis.Application.Common;
using Altairis.Application.Dtos.Hotels;
using Altairis.Domain.Entities;
using System.Collections.Generic;

namespace Altairis.Application.IServices;

public interface IHotelService
{
    Task<PagedResult<HotelListItemDto>> GetAsync(IReadOnlyList<int>? hotelIds, string? query, int page, int pageSize, CancellationToken ct);
    Task<Hotel> CreateAsync(CreateHotelDto request, CancellationToken ct);
    Task<HotelDto?> GetByIdAsync(int id, CancellationToken ct);
}

