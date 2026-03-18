namespace Altairis.Application.Dtos.Reservations;

public sealed record CreateReservationDto(
    string Reference,
    int HotelId,
    int RoomTypeId,
    string GuestName,
    string? GuestEmail,
    DateOnly CheckIn,
    DateOnly CheckOut,
    int Units,
    string? Status);

