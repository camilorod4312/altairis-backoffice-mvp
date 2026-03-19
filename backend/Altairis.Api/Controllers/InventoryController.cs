using Altairis.Application.Common;
using Altairis.Application.Dtos.Inventory;
using Altairis.Application.IServices;
using Altairis.Api.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.Api.Controllers;

[ApiController]
[Route("api/inventory")]
public sealed class InventoryController : ControllerBase
{
    private readonly IInventoryService _service;

    public InventoryController(IInventoryService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,HotelOwner,Ops")]
    public async Task<ActionResult<PagedResult<InventoryEntryDto>>> Get(
        [FromQuery] int? hotelId,
        [FromQuery] int? roomTypeId,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var allowedHotelIds = HotelScope.GetAllowedHotelIds(User);

        IReadOnlyList<int>? hotelIdsFilter;
        if (allowedHotelIds is null)
        {
            // Admin: null means "all hotels".
            hotelIdsFilter = hotelId is null ? null : new[] { hotelId.Value };
        }
        else
        {
            // Tenant roles: null means "all assigned hotels".
            if (hotelId is not null && !allowedHotelIds.Contains(hotelId.Value))
            {
                return Forbid();
            }

            hotelIdsFilter = hotelId is null ? allowedHotelIds : new[] { hotelId.Value };
        }

        var result = await _service.GetAsync(hotelIdsFilter, roomTypeId, from, to, page, pageSize, ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,HotelOwner,Ops")]
    public async Task<IActionResult> Upsert([FromBody] UpsertInventoryEntryDto request, CancellationToken ct)
    {
        var forbid = HotelScope.EnforceTenantHotel(this, request.HotelId);
        if (forbid is not null) return forbid;

        try
        {
            var entry = await _service.UpsertAsync(request, ct);
            var dto = new InventoryEntryDto(
                entry.Id,
                entry.HotelId,
                entry.RoomTypeId,
                entry.Date,
                entry.TotalUnits,
                entry.AvailableUnits);

            return Ok(dto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

