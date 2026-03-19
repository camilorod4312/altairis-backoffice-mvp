using Altairis.Application.Common;
using Altairis.Application.Dtos.Inventory;
using Altairis.Domain.Entities;
using System.Collections.Generic;

namespace Altairis.Application.IServices;

public interface IInventoryService
{
    Task<PagedResult<InventoryEntryDto>> GetAsync(IReadOnlyList<int>? hotelIds, int? roomTypeId, DateOnly? from, DateOnly? to, int page, int pageSize, CancellationToken ct);
    Task<InventoryEntry> UpsertAsync(UpsertInventoryEntryDto request, CancellationToken ct);
}

