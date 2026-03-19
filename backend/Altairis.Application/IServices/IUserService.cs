using Altairis.Application.Common;
using Altairis.Application.Dtos.Users;
using Altairis.Domain.Entities;

namespace Altairis.Application.IServices;

public interface IUserService
{
    Task<PagedResult<UserListItemDto>> GetAsync(string? query, int page, int pageSize, CancellationToken ct);
    Task<UserDto?> GetByIdAsync(int id, CancellationToken ct);
    Task<User> CreateAsync(UpsertUserDto request, CancellationToken ct);
    Task<User?> UpdateAsync(int id, UpsertUserDto request, CancellationToken ct);
}

