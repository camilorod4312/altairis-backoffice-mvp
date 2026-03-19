using Altairis.Application.Common;
using Altairis.Application.Dtos.Reservations;
using Altairis.Application.IServices;
using Altairis.Application.Repositories;
using Altairis.Domain.Entities;
using System.Collections.Generic;

namespace Altairis.Application.Services;

public sealed class ReservationService : IReservationService
{
    private readonly IReservationRepository _repo;
    private readonly IRoomTypeRepository _roomTypeRepo;

    public ReservationService(IReservationRepository repo, IRoomTypeRepository roomTypeRepo)
    {
        _repo = repo;
        _roomTypeRepo = roomTypeRepo;
    }

    public async Task<PagedResult<ReservationListItemDto>> GetAsync(
        IReadOnlyList<int>? hotelIds,
        string? query,
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

        var (total, items) = await _repo.ListAsync(hotelIds, query, from, to, page, pageSize, ct);
        return new PagedResult<ReservationListItemDto>(page, pageSize, total, items);
    }

    public async Task<Reservation> CreateAsync(CreateReservationDto request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Reference) ||
            request.HotelId <= 0 ||
            request.RoomTypeId <= 0 ||
            string.IsNullOrWhiteSpace(request.GuestName) ||
            request.Units <= 0)
        {
            throw new ArgumentException("Reference, HotelId, RoomTypeId, GuestName and Units are required.");
        }

        if (request.CheckOut <= request.CheckIn)
        {
            throw new ArgumentException("CheckOut must be after CheckIn.");
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

        var entity = new Reservation
        {
            Reference = request.Reference.Trim(),
            HotelId = request.HotelId,
            RoomTypeId = request.RoomTypeId,
            GuestName = request.GuestName.Trim(),
            GuestEmail = string.IsNullOrWhiteSpace(request.GuestEmail) ? null : request.GuestEmail.Trim(),
            CheckIn = request.CheckIn,
            CheckOut = request.CheckOut,
            Units = request.Units,
            Status = string.IsNullOrWhiteSpace(request.Status) ? "Confirmed" : request.Status.Trim()
        };

        await _repo.AddAsync(entity, ct);
        await _repo.SaveChangesAsync(ct);
        return entity;
    }

    public Task<ReservationDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        if (id <= 0) return Task.FromResult<ReservationDto?>(null);
        return _repo.GetByIdAsync(id, ct);
    }
}

