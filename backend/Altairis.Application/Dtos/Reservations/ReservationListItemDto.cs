namespace Altairis.Application.Dtos.Reservations;

public sealed record ReservationListItemDto(
    int Id,
    string Reference,
    int HotelId,
    int RoomTypeId,
    string GuestName,
    DateOnly CheckIn,
    DateOnly CheckOut,
    int Units,
    string Status,
    DateTime CreatedUtc);

