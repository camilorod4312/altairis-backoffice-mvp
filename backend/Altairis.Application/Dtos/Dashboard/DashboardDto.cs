namespace Altairis.Application.Dtos.Dashboard;

public sealed record DashboardDto(
    int Arrivals,
    int Departures,
    int TotalBookings,
    IReadOnlyList<StatusCountDto> StatusBreakdown,
    OccupancyDto Occupancy,
    IReadOnlyList<RecentBookingDto> RecentBookings);

public sealed record StatusCountDto(string Status, int Count);

public sealed record OccupancyDto(int TotalUnits, int AvailableUnits);

public sealed record RecentBookingDto(
    int Id, string Reference, int HotelId, string GuestName);
