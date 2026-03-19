using Altairis.Application.Dtos.Users;
using Altairis.Domain.Entities;
using System.Collections.Generic;

namespace Altairis.Application.Repositories;

public interface IUserRepository
{
    Task<(int total, List<UserListItemDto> items)> ListAsync(string? query, int page, int pageSize, CancellationToken ct);
    Task<UserDto?> GetByIdAsync(int id, CancellationToken ct);
    Task<User?> GetEntityByIdAsync(int id, CancellationToken ct);
    Task<bool> EmailExistsAsync(string email, int? excludingUserId, CancellationToken ct);
    Task AddAsync(User user, CancellationToken ct);
    Task SetUserHotelAssignmentsAsync(int userId, IReadOnlyList<int> hotelIds, CancellationToken ct);
    Task AddUserHotelAssignmentsAsync(int userId, IReadOnlyList<int> hotelIds, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

