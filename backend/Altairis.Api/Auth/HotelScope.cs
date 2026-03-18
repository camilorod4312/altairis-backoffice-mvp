using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.Api.Auth;

public static class HotelScope
{
    public static int? GetHotelIdClaim(ClaimsPrincipal user)
    {
        var value = user.FindFirstValue("hotelId");
        return int.TryParse(value, out var id) ? id : null;
    }

    public static IActionResult? EnforceOwnerHotel(ControllerBase controller, int requestedHotelId)
    {
        if (!controller.User.IsInRole(AuthRoles.HotelOwner))
        {
            return null;
        }

        var ownerHotelId = GetHotelIdClaim(controller.User);
        if (ownerHotelId is null)
        {
            return controller.Forbid();
        }

        return ownerHotelId.Value == requestedHotelId
            ? null
            : controller.Forbid();
    }
}

