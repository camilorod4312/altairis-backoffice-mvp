using Altairis.Application.Dtos.Dashboard;

namespace Altairis.Application.Repositories;

public interface IDashboardRepository
{
    Task<DashboardDto> GetDashboardAsync(
        IReadOnlyList<int>? hotelIds,
        DateOnly date,
        CancellationToken ct);
}
