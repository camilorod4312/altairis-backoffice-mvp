namespace Altairis.Domain.Entities;

public sealed class Hotel
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string City { get; set; }
    public required string Country { get; set; }
    public string? AddressLine1 { get; set; }
    public string? PostalCode { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

    public List<RoomType> RoomTypes { get; set; } = [];
    public List<InventoryEntry> InventoryEntries { get; set; } = [];
    public List<Reservation> Reservations { get; set; } = [];
}

