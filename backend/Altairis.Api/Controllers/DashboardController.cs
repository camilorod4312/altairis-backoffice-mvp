using Altairis.Application.Dtos.Dashboard;
using Altairis.Application.IServices;
using Altairis.Api.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,HotelOwner,Ops")]
    public async Task<ActionResult<DashboardDto>> Get(
        [FromQuery] DateOnly date,
        [FromQuery] int? hotelId,
        CancellationToken ct = default)
    {
        var allowedHotelIds = HotelScope.GetAllowedHotelIds(User);

        IReadOnlyList<int>? hotelIdsFilter;
        if (allowedHotelIds is null)
        {
            hotelIdsFilter = hotelId is null ? null : new[] { hotelId.Value };
        }
        else
        {
            if (hotelId is not null && !allowedHotelIds.Contains(hotelId.Value))
            {
                return Forbid();
            }

            hotelIdsFilter = hotelId is null ? allowedHotelIds : new[] { hotelId.Value };
        }

        var result = await _service.GetDashboardAsync(hotelIdsFilter, date, ct);
        return Ok(result);
    }
}
