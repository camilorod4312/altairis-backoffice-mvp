using Altairis.Application.Common;
using Altairis.Application.Dtos.RoomTypes;
using Altairis.Application.IServices;
using Altairis.Api.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.Api.Controllers;

[ApiController]
[Route("api/room-types")]
public sealed class RoomTypesController : ControllerBase
{
    private readonly IRoomTypeService _service;

    public RoomTypesController(IRoomTypeService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<RoomTypeListItemDto>>> List(
        [FromQuery] int? hotelId,
        [FromQuery(Name = "q")] string? query,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken ct = default)
    {
        if (User.IsInRole(AuthRoles.HotelOwner))
        {
            hotelId = HotelScope.GetHotelIdClaim(User);
        }

        var result = await _service.GetAsync(hotelId, query, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoomTypeDto>> GetById([FromRoute] int id, CancellationToken ct = default)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        if (dto is null) return NotFound();

        var forbid = HotelScope.EnforceOwnerHotel(this, dto.HotelId);
        if (forbid is not null) return Forbid();

        return Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,HotelOwner")]
    public async Task<IActionResult> Create([FromBody] CreateRoomTypeDto request, CancellationToken ct)
    {
        var forbid = HotelScope.EnforceOwnerHotel(this, request.HotelId);
        if (forbid is not null) return forbid;

        try
        {
            var created = await _service.CreateAsync(request, ct);
            var dto = new RoomTypeDto(created.Id, created.HotelId, created.Code, created.Name, created.MaxOccupancy);
            return Created($"/api/room-types/{created.Id}", dto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

