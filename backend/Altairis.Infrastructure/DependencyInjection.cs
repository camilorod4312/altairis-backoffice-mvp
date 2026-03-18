using Altairis.Application.Repositories;
using Altairis.Infrastructure.Data;
using Altairis.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Altairis.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AltairisDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("Default");
            options.UseSqlServer(connectionString);
        });

        services.AddScoped<IHotelRepository, HotelRepository>();
        services.AddScoped<IRoomTypeRepository, RoomTypeRepository>();
        services.AddScoped<IInventoryRepository, InventoryRepository>();
        services.AddScoped<IReservationRepository, ReservationRepository>();
        return services;
    }
}

