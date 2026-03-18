namespace Altairis.Application.Dtos.Inventory;

public sealed record UpsertInventoryEntryDto(
    int HotelId,
    int RoomTypeId,
    DateOnly Date,
    int TotalUnits,
    int AvailableUnits);

