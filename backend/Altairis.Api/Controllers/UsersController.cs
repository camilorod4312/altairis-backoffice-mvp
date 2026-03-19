using Altairis.Application.Common;
using Altairis.Application.Dtos.Users;
using Altairis.Application.IServices;
using Altairis.Api.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = AuthRoles.Admin)]
public sealed class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<UserListItemDto>>> List(
        [FromQuery(Name = "q")] string? query,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken ct = default)
    {
        var result = await _service.GetAsync(query, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDto>> GetById([FromRoute] int id, CancellationToken ct = default)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        if (dto is null) return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertUserDto request, CancellationToken ct)
    {
        try
        {
            var created = await _service.CreateAsync(request, ct);
            var dto = await _service.GetByIdAsync(created.Id, ct);
            if (dto is null) return NotFound();
            return Created($"/api/users/{created.Id}", dto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpsertUserDto request, CancellationToken ct)
    {
        try
        {
            var updated = await _service.UpdateAsync(id, request, ct);
            if (updated is null) return NotFound();
            var dto = await _service.GetByIdAsync(updated.Id, ct);
            if (dto is null) return NotFound();
            return Ok(dto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

