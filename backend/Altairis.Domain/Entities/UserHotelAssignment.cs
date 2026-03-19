namespace Altairis.Domain.Entities;

public sealed class UserHotelAssignment
{
    public int UserId { get; set; }
    public int HotelId { get; set; }

    public User? User { get; set; }
    public Hotel? Hotel { get; set; }
}

