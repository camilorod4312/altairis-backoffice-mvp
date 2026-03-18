namespace Altairis.Domain.Entities;

public sealed class Reservation
{
    public int Id { get; set; }
    public required string Reference { get; set; }
    public int HotelId { get; set; }
    public int RoomTypeId { get; set; }
    public required string GuestName { get; set; }
    public string? GuestEmail { get; set; }
    public DateOnly CheckIn { get; set; }
    public DateOnly CheckOut { get; set; }
    public int Units { get; set; } = 1;
    public required string Status { get; set; } = "Confirmed";
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

    public Hotel? Hotel { get; set; }
    public RoomType? RoomType { get; set; }
}

