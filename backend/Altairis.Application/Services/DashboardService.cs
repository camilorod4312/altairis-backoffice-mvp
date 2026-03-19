using Altairis.Application.Dtos.Dashboard;
using Altairis.Application.IServices;
using Altairis.Application.Repositories;

namespace Altairis.Application.Services;

public sealed class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repo;

    public DashboardService(IDashboardRepository repo)
    {
        _repo = repo;
    }

    public Task<DashboardDto> GetDashboardAsync(
        IReadOnlyList<int>? hotelIds,
        DateOnly date,
        CancellationToken ct)
    {
        return _repo.GetDashboardAsync(hotelIds, date, ct);
    }
}
