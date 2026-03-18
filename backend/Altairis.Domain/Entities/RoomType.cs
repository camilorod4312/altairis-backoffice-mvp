namespace Altairis.Domain.Entities;

public sealed class RoomType
{
    public int Id { get; set; }
    public int HotelId { get; set; }
    public required string Code { get; set; }
    public required string Name { get; set; }
    public int MaxOccupancy { get; set; }

    public Hotel? Hotel { get; set; }
    public List<InventoryEntry> InventoryEntries { get; set; } = [];
    public List<Reservation> Reservations { get; set; } = [];
}

