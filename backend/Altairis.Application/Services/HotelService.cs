using Altairis.Application.Common;
using Altairis.Application.Dtos.Hotels;
using Altairis.Application.IServices;
using Altairis.Application.Repositories;
using Altairis.Domain.Entities;
using System.Collections.Generic;

namespace Altairis.Application.Services;

public sealed class HotelService : IHotelService
{
    private readonly IHotelRepository _repo;
    private readonly IUserRepository _userRepo;

    public HotelService(IHotelRepository repo, IUserRepository userRepo)
    {
        _repo = repo;
        _userRepo = userRepo;
    }

    public async Task<PagedResult<HotelListItemDto>> GetAsync(IReadOnlyList<int>? hotelIds, string? query, int page, int pageSize, CancellationToken ct)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize switch
        {
            < 1 => 25,
            > 200 => 200,
            _ => pageSize
        };

        var (total, items) = await _repo.ListAsync(hotelIds, query, page, pageSize, ct);
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

        // Admin can assign one or more owners to the newly created hotel.
        if (request.OwnerUserIds is not null && request.OwnerUserIds.Count > 0)
        {
            foreach (var ownerUserId in request.OwnerUserIds.Distinct())
            {
                var owner = await _userRepo.GetEntityByIdAsync(ownerUserId, ct);
                if (owner is null) throw new ArgumentException("Owner user not found.");
                if (owner.Role != UserRole.HotelOwner) throw new ArgumentException("Selected user must be Hotel owner.");

                await _userRepo.AddUserHotelAssignmentsAsync(ownerUserId, new[] { entity.Id }, ct);
            }

            await _userRepo.SaveChangesAsync(ct);
        }

        return entity;
    }

    public Task<HotelDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        if (id <= 0) return Task.FromResult<HotelDto?>(null);
        return _repo.GetByIdAsync(id, ct);
    }
}

