namespace Altairis.Domain.Entities;

public sealed class InventoryEntry
{
    public int Id { get; set; }
    public int HotelId { get; set; }
    public int RoomTypeId { get; set; }
    public DateOnly Date { get; set; }
    public int TotalUnits { get; set; }
    public int AvailableUnits { get; set; }

    public Hotel? Hotel { get; set; }
    public RoomType? RoomType { get; set; }
}

