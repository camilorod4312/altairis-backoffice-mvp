using Altairis.Application.IServices;
using Altairis.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Altairis.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IHotelService, HotelService>();
        services.AddScoped<IRoomTypeService, RoomTypeService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IReservationService, ReservationService>();
        return services;
    }
}

