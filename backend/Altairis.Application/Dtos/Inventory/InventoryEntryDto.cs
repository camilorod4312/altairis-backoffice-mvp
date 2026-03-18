namespace Altairis.Application.Dtos.Inventory;

public sealed record InventoryEntryDto(
    int Id,
    int HotelId,
    int RoomTypeId,
    DateOnly Date,
    int TotalUnits,
    int AvailableUnits);

