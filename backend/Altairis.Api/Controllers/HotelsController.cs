using Altairis.Application.Common;
using Altairis.Application.Dtos.Hotels;
using Altairis.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.Api.Controllers;

[ApiController]
[Route("api/hotels")]
public sealed class HotelsController : ControllerBase
{
    private readonly IHotelService _service;

    public HotelsController(IHotelService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<HotelListItemDto>>> List(
        [FromQuery(Name = "q")] string? query,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken ct = default)
    {
        var result = await _service.GetAsync(query, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<HotelDto>> GetById([FromRoute] int id, CancellationToken ct = default)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        if (dto is null) return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateHotelDto request, CancellationToken ct)
    {
        try
        {
            var created = await _service.CreateAsync(request, ct);
            var dto = new HotelDto(
                created.Id,
                created.Name,
                created.City,
                created.Country,
                created.AddressLine1,
                created.PostalCode,
                created.IsActive,
                created.CreatedUtc);

            return Created($"/api/hotels/{created.Id}", dto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

