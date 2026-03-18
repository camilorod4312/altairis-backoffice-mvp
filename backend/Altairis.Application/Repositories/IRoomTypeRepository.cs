using Altairis.Application.Dtos.RoomTypes;
using Altairis.Domain.Entities;

namespace Altairis.Application.Repositories;

public interface IRoomTypeRepository
{
    Task<(int total, List<RoomTypeListItemDto> items)> ListAsync(int? hotelId, string? query, int page, int pageSize, CancellationToken ct);
    Task<RoomTypeDto?> GetByIdAsync(int id, CancellationToken ct);
    Task AddAsync(RoomType roomType, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

