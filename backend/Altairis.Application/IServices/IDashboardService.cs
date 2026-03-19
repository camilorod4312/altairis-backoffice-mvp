using Altairis.Application.Dtos.Dashboard;

namespace Altairis.Application.IServices;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync(
        IReadOnlyList<int>? hotelIds,
        DateOnly date,
        CancellationToken ct);
}
