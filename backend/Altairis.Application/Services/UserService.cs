using Altairis.Application.Common;
using Altairis.Application.Dtos.Users;
using Altairis.Application.IServices;
using Altairis.Application.Repositories;
using Altairis.Domain.Entities;
using System;

namespace Altairis.Application.Services;

public sealed class UserService : IUserService
{
    private readonly IUserRepository _repo;

    public UserService(IUserRepository repo)
    {
        _repo = repo;
    }

    public async Task<PagedResult<UserListItemDto>> GetAsync(string? query, int page, int pageSize, CancellationToken ct)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize switch
        {
            < 1 => 25,
            > 200 => 200,
            _ => pageSize
        };

        var (total, items) = await _repo.ListAsync(query, page, pageSize, ct);
        return new PagedResult<UserListItemDto>(page, pageSize, total, items);
    }

    public Task<UserDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        if (id <= 0) return Task.FromResult<UserDto?>(null);
        return _repo.GetByIdAsync(id, ct);
    }

    public async Task<User> CreateAsync(UpsertUserDto request, CancellationToken ct)
    {
        Validate(request, requirePassword: true);

        var email = request.Email.Trim().ToLowerInvariant();
        if (await _repo.EmailExistsAsync(email, excludingUserId: null, ct))
        {
            throw new ArgumentException("Email already exists.");
        }

        var user = new User
        {
            Email = email,
            Role = request.Role,
            HotelId = request.HotelIds is not null && request.HotelIds.Count > 0 ? request.HotelIds[0] : null,
            IsActive = request.IsActive ?? true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password!)
        };

        await _repo.AddAsync(user, ct);
        await _repo.SaveChangesAsync(ct);

        // Persist tenant scoping in join table.
        var assignedHotelIds = request.Role is UserRole.HotelOwner or UserRole.Ops
            ? (request.HotelIds ?? Array.Empty<int>())
            : Array.Empty<int>();
        await _repo.SetUserHotelAssignmentsAsync(user.Id, assignedHotelIds, ct);
        await _repo.SaveChangesAsync(ct);

        return user;
    }

    public async Task<User?> UpdateAsync(int id, UpsertUserDto request, CancellationToken ct)
    {
        if (id <= 0) return null;
        Validate(request, requirePassword: false);

        var entity = await _repo.GetEntityByIdAsync(id, ct);
        if (entity is null) return null;

        var email = request.Email.Trim().ToLowerInvariant();
        if (await _repo.EmailExistsAsync(email, excludingUserId: id, ct))
        {
            throw new ArgumentException("Email already exists.");
        }

        entity.Email = email;
        entity.Role = request.Role;
        entity.HotelId = request.HotelIds is not null && request.HotelIds.Count > 0 ? request.HotelIds[0] : null;
        if (request.IsActive.HasValue) entity.IsActive = request.IsActive.Value;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            entity.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        var assignedHotelIds = request.Role is UserRole.HotelOwner or UserRole.Ops
            ? (request.HotelIds ?? Array.Empty<int>())
            : Array.Empty<int>();
        await _repo.SetUserHotelAssignmentsAsync(entity.Id, assignedHotelIds, ct);
        await _repo.SaveChangesAsync(ct);

        return entity;
    }

    private static void Validate(UpsertUserDto request, bool requirePassword)
    {
        if (string.IsNullOrWhiteSpace(request.Email)) throw new ArgumentException("Email is required.");
        if (!Enum.IsDefined(typeof(UserRole), request.Role)) throw new ArgumentException("Role is required.");

        // HotelOwner can have zero hotels; Ops must have exactly one hotel (tenant scoped).
        if (request.Role == UserRole.Ops)
        {
            if (request.HotelIds is null || request.HotelIds.Count != 1)
                throw new ArgumentException("Exactly one hotel is required for Ops role.");
        }

        if (requirePassword && string.IsNullOrWhiteSpace(request.Password))
        {
            throw new ArgumentException("Password is required.");
        }

        if (!string.IsNullOrWhiteSpace(request.Password) && request.Password.Trim().Length < 6)
        {
            throw new ArgumentException("Password must be at least 6 characters.");
        }
    }
}

