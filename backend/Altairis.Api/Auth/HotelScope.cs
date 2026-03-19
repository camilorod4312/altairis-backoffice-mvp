using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.Api.Auth;

public static class HotelScope
{
    public static IReadOnlyList<int>? GetHotelIdsClaim(ClaimsPrincipal user)
    {
        var value = user.FindFirstValue("hotelIds");
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var parts = value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var ids = new List<int>(parts.Length);
        foreach (var p in parts)
        {
            if (int.TryParse(p, out var id))
            {
                ids.Add(id);
            }
        }

        return ids.Count == 0 ? null : ids;
    }

    public static IActionResult? EnforceTenantHotel(ControllerBase controller, int requestedHotelId)
    {
        // Tenant scoping applies to both HotelOwner and Ops roles.
        if (!controller.User.IsInRole(AuthRoles.HotelOwner) && !controller.User.IsInRole(AuthRoles.Ops))
        {
            return null;
        }

        var allowedHotelIds = GetHotelIdsClaim(controller.User);
        if (allowedHotelIds is null)
        {
            return controller.Forbid();
        }

        return allowedHotelIds.Contains(requestedHotelId) ? null : controller.Forbid();
    }

    public static IReadOnlyList<int>? GetAllowedHotelIds(ClaimsPrincipal user)
    {
        if (!user.IsInRole(AuthRoles.HotelOwner) && !user.IsInRole(AuthRoles.Ops))
        {
            return null;
        }

        // For tenant roles, returning an empty list means "scoped to nothing"
        // (and prevents accidentally treating them like Admin).
        return GetHotelIdsClaim(user) ?? Array.Empty<int>();
    }
}

