using Altairis.Application.Dtos.Users;
using Altairis.Application.Repositories;
using Altairis.Domain.Entities;
using Altairis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Infrastructure.Repositories;

internal sealed class UserRepository : IUserRepository
{
    private readonly AltairisDbContext _db;

    public UserRepository(AltairisDbContext db)
    {
        _db = db;
    }

    public async Task<(int total, List<UserListItemDto> items)> ListAsync(string? query, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.Users.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim();
            q = q.Where(u =>
                u.Email.Contains(term) ||
                EF.Property<string>(u, nameof(User.Role)).Contains(term));
        }

        var total = await q.CountAsync(ct);
        var pageUsers = await q
            .OrderBy(u => u.Email)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new { u.Id, u.Email, u.Role, u.IsActive, u.CreatedUtc })
            .ToListAsync(ct);

        var userIds = pageUsers.Select(u => u.Id).ToList();
        var assignments = await _db.UserHotelAssignments
            .AsNoTracking()
            .Where(a => userIds.Contains(a.UserId))
            .Select(a => new { a.UserId, a.HotelId })
            .ToListAsync(ct);

        var hotelIdsByUser = assignments
            .GroupBy(a => a.UserId)
            .ToDictionary(g => g.Key, g => (IReadOnlyList<int>)g.Select(x => x.HotelId).Distinct().ToList());

        var items = pageUsers
            .Select(u => new UserListItemDto(
                u.Id,
                u.Email,
                u.Role,
                hotelIdsByUser.TryGetValue(u.Id, out var ids) ? ids : Array.Empty<int>(),
                u.IsActive,
                u.CreatedUtc))
            .ToList();

        return (total, items);
    }

    public async Task<UserDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id, ct);

        if (user is null) return null;

        var hotelIds = await _db.UserHotelAssignments
            .AsNoTracking()
            .Where(a => a.UserId == id)
            .Select(a => a.HotelId)
            .Distinct()
            .ToListAsync(ct);

        return new UserDto(user.Id, user.Email, user.Role, hotelIds, user.IsActive, user.CreatedUtc);
    }

    public Task<User?> GetEntityByIdAsync(int id, CancellationToken ct) =>
        _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<bool> EmailExistsAsync(string email, int? excludingUserId, CancellationToken ct)
    {
        var q = _db.Users.AsNoTracking().Where(u => u.Email == email);
        if (excludingUserId.HasValue) q = q.Where(u => u.Id != excludingUserId.Value);
        return q.AnyAsync(ct);
    }

    public Task AddAsync(User user, CancellationToken ct)
    {
        _db.Users.Add(user);
        return Task.CompletedTask;
    }

    public Task SetUserHotelAssignmentsAsync(int userId, IReadOnlyList<int> hotelIds, CancellationToken ct)
    {
        var existing = _db.UserHotelAssignments.Where(a => a.UserId == userId);
        _db.UserHotelAssignments.RemoveRange(existing);

        if (hotelIds.Count > 0)
        {
            var distinct = hotelIds.Distinct();
            foreach (var hotelId in distinct)
            {
                _db.UserHotelAssignments.Add(new UserHotelAssignment { UserId = userId, HotelId = hotelId });
            }
        }

        return Task.CompletedTask;
    }

    public Task AddUserHotelAssignmentsAsync(int userId, IReadOnlyList<int> hotelIds, CancellationToken ct)
    {
        if (hotelIds.Count == 0) return Task.CompletedTask;

        var distinct = hotelIds.Distinct();
        foreach (var hotelId in distinct)
        {
            var exists = _db.UserHotelAssignments.Any(a => a.UserId == userId && a.HotelId == hotelId);
            if (!exists)
            {
                _db.UserHotelAssignments.Add(new UserHotelAssignment { UserId = userId, HotelId = hotelId });
            }
        }

        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}

