namespace Altairis.Api.Auth;

using Altairis.Domain.Entities;

public static class AuthRoles
{
    public const string Admin = nameof(UserRole.Admin);
    public const string HotelOwner = nameof(UserRole.HotelOwner);
    public const string Ops = nameof(UserRole.Ops);
}

