using Altairis.Application.Common;
using Altairis.Application.Dtos.RoomTypes;
using Altairis.Domain.Entities;
using System.Collections.Generic;

namespace Altairis.Application.IServices;

public interface IRoomTypeService
{
    Task<PagedResult<RoomTypeListItemDto>> GetAsync(IReadOnlyList<int>? hotelIds, string? query, int page, int pageSize, CancellationToken ct);
    Task<RoomType> CreateAsync(CreateRoomTypeDto request, CancellationToken ct);
    Task<RoomTypeDto?> GetByIdAsync(int id, CancellationToken ct);
}

