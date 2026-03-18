using Altairis.Application.Common;
using Altairis.Application.Dtos.RoomTypes;
using Altairis.Application.IServices;
using Altairis.Application.Repositories;
using Altairis.Domain.Entities;

namespace Altairis.Application.Services;

public sealed class RoomTypeService : IRoomTypeService
{
    private readonly IRoomTypeRepository _repo;

    public RoomTypeService(IRoomTypeRepository repo)
    {
        _repo = repo;
    }

    public async Task<PagedResult<RoomTypeListItemDto>> GetAsync(int? hotelId, string? query, int page, int pageSize, CancellationToken ct)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize switch
        {
            < 1 => 25,
            > 200 => 200,
            _ => pageSize
        };

        var (total, items) = await _repo.ListAsync(hotelId, query, page, pageSize, ct);
        return new PagedResult<RoomTypeListItemDto>(page, pageSize, total, items);
    }

    public async Task<RoomType> CreateAsync(CreateRoomTypeDto request, CancellationToken ct)
    {
        if (request.HotelId <= 0 ||
            string.IsNullOrWhiteSpace(request.Code) ||
            string.IsNullOrWhiteSpace(request.Name) ||
            request.MaxOccupancy <= 0)
        {
            throw new ArgumentException("HotelId, Code, Name and MaxOccupancy are required.");
        }

        var entity = new RoomType
        {
            HotelId = request.HotelId,
            Code = request.Code.Trim(),
            Name = request.Name.Trim(),
            MaxOccupancy = request.MaxOccupancy
        };

        await _repo.AddAsync(entity, ct);
        await _repo.SaveChangesAsync(ct);
        return entity;
    }

    public Task<RoomTypeDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        if (id <= 0) return Task.FromResult<RoomTypeDto?>(null);
        return _repo.GetByIdAsync(id, ct);
    }
}

