using Altairis.Application.Common;
using Altairis.Application.Dtos.Reservations;
using Altairis.Application.IServices;
using Altairis.Api.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.Api.Controllers;

[ApiController]
[Route("api/reservations")]
public sealed class ReservationsController : ControllerBase
{
    private readonly IReservationService _service;

    public ReservationsController(IReservationService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,HotelOwner,Ops")]
    public async Task<ActionResult<PagedResult<ReservationListItemDto>>> List(
        [FromQuery] int? hotelId,
        [FromQuery(Name = "q")] string? query,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
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

        var result = await _service.GetAsync(hotelIdsFilter, query, from, to, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,HotelOwner,Ops")]
    public async Task<ActionResult<ReservationDto>> GetById([FromRoute] int id, CancellationToken ct = default)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        if (dto is null) return NotFound();

        var forbid = HotelScope.EnforceTenantHotel(this, dto.HotelId);
        if (forbid is not null) return Forbid();

        return Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,HotelOwner,Ops")]
    public async Task<IActionResult> Create([FromBody] CreateReservationDto request, CancellationToken ct)
    {
        var forbid = HotelScope.EnforceTenantHotel(this, request.HotelId);
        if (forbid is not null) return forbid;

        try
        {
            var created = await _service.CreateAsync(request, ct);
            var dto = new ReservationDto(
                created.Id,
                created.Reference,
                created.HotelId,
                created.RoomTypeId,
                created.GuestName,
                created.GuestEmail,
                created.CheckIn,
                created.CheckOut,
                created.Units,
                created.Status,
                created.CreatedUtc);

            return Created($"/api/reservations/{created.Id}", dto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

