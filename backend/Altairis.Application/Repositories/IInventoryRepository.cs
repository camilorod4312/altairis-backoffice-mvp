using Altairis.Application.Dtos.Inventory;
using Altairis.Domain.Entities;

namespace Altairis.Application.Repositories;

public interface IInventoryRepository
{
    Task<(int total, List<InventoryEntryDto> items)> ListAsync(int? hotelId, int? roomTypeId, DateOnly? from, DateOnly? to, int page, int pageSize, CancellationToken ct);
    Task<InventoryEntry?> FindAsync(int hotelId, int roomTypeId, DateOnly date, CancellationToken ct);
    Task AddAsync(InventoryEntry entry, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

