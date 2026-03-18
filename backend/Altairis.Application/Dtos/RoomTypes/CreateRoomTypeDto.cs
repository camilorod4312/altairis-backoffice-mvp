namespace Altairis.Application.Dtos.RoomTypes;

public sealed record CreateRoomTypeDto(
    int HotelId,
    string Code,
    string Name,
    int MaxOccupancy);

