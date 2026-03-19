using Altairis.Application.Common;
using Altairis.Application.Dtos.Inventory;
using Altairis.Application.IServices;
using Altairis.Application.Repositories;
using Altairis.Domain.Entities;
using System.Collections.Generic;

namespace Altairis.Application.Services;

public sealed class InventoryService : IInventoryService
{
    private readonly IInventoryRepository _repo;
    private readonly IRoomTypeRepository _roomTypeRepo;

    public InventoryService(IInventoryRepository repo, IRoomTypeRepository roomTypeRepo)
    {
        _repo = repo;
        _roomTypeRepo = roomTypeRepo;
    }

    public async Task<PagedResult<InventoryEntryDto>> GetAsync(
        IReadOnlyList<int>? hotelIds,
        int? roomTypeId,
        DateOnly? from,
        DateOnly? to,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize switch
        {
            < 1 => 25,
            > 200 => 200,
            _ => pageSize
        };

        var (total, items) = await _repo.ListAsync(hotelIds, roomTypeId, from, to, page, pageSize, ct);
        return new PagedResult<InventoryEntryDto>(page, pageSize, total, items);
    }

    public async Task<InventoryEntry> UpsertAsync(UpsertInventoryEntryDto request, CancellationToken ct)
    {
        if (request.HotelId <= 0 ||
            request.RoomTypeId <= 0 ||
            request.TotalUnits < 0 ||
            request.AvailableUnits < 0)
        {
            throw new ArgumentException("HotelId, RoomTypeId, Date, TotalUnits and AvailableUnits are required.");
        }

        if (request.AvailableUnits > request.TotalUnits)
        {
            throw new ArgumentException("AvailableUnits cannot be greater than TotalUnits.");
        }

        var roomType = await _roomTypeRepo.GetByIdAsync(request.RoomTypeId, ct);
        if (roomType is null)
        {
            throw new ArgumentException("Room type not found.");
        }

        if (roomType.HotelId != request.HotelId)
        {
            throw new ArgumentException("Room type does not belong to the provided hotel.");
        }

        var existing = await _repo.FindAsync(request.HotelId, request.RoomTypeId, request.Date, ct);
        if (existing is null)
        {
            var created = new InventoryEntry
            {
                HotelId = request.HotelId,
                RoomTypeId = request.RoomTypeId,
                Date = request.Date,
                TotalUnits = request.TotalUnits,
                AvailableUnits = request.AvailableUnits
            };

            await _repo.AddAsync(created, ct);
            await _repo.SaveChangesAsync(ct);
            return created;
        }

        existing.TotalUnits = request.TotalUnits;
        existing.AvailableUnits = request.AvailableUnits;
        await _repo.SaveChangesAsync(ct);
        return existing;
    }
}

