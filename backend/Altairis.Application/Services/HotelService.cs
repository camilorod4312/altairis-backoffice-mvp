using Altairis.Application.Common;
using Altairis.Application.Dtos.Hotels;
using Altairis.Application.IServices;
using Altairis.Application.Repositories;
using Altairis.Domain.Entities;

namespace Altairis.Application.Services;

public sealed class HotelService : IHotelService
{
    private readonly IHotelRepository _repo;

    public HotelService(IHotelRepository repo)
    {
        _repo = repo;
    }

    public async Task<PagedResult<HotelListItemDto>> GetAsync(string? query, int page, int pageSize, CancellationToken ct)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize switch
        {
            < 1 => 25,
            > 200 => 200,
            _ => pageSize
        };

        var (total, items) = await _repo.ListAsync(query, page, pageSize, ct);
        return new PagedResult<HotelListItemDto>(page, pageSize, total, items);
    }

    public async Task<Hotel> CreateAsync(CreateHotelDto request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.City) ||
            string.IsNullOrWhiteSpace(request.Country))
        {
            throw new ArgumentException("Name, City and Country are required.");
        }

        var entity = new Hotel
        {
            Name = request.Name.Trim(),
            City = request.City.Trim(),
            Country = request.Country.Trim(),
            AddressLine1 = string.IsNullOrWhiteSpace(request.AddressLine1) ? null : request.AddressLine1.Trim(),
            PostalCode = string.IsNullOrWhiteSpace(request.PostalCode) ? null : request.PostalCode.Trim(),
            IsActive = request.IsActive ?? true
        };

        await _repo.AddAsync(entity, ct);
        await _repo.SaveChangesAsync(ct);
        return entity;
    }

    public Task<HotelDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        if (id <= 0) return Task.FromResult<HotelDto?>(null);
        return _repo.GetByIdAsync(id, ct);
    }
}

