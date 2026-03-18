using Altairis.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Infrastructure.Data;

public sealed class AltairisDbContext : DbContext
{
    public AltairisDbContext(DbContextOptions<AltairisDbContext> options) : base(options)
    {
    }

    public DbSet<Hotel> Hotels => Set<Hotel>();
    public DbSet<RoomType> RoomTypes => Set<RoomType>();
    public DbSet<InventoryEntry> InventoryEntries => Set<InventoryEntry>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var hotel = modelBuilder.Entity<Hotel>();
        hotel.HasKey(x => x.Id);
        hotel.Property(x => x.Name).HasMaxLength(200).IsRequired();
        hotel.Property(x => x.City).HasMaxLength(120).IsRequired();
        hotel.Property(x => x.Country).HasMaxLength(120).IsRequired();
        hotel.Property(x => x.AddressLine1).HasMaxLength(240);
        hotel.Property(x => x.PostalCode).HasMaxLength(30);
        hotel.Property(x => x.IsActive).HasDefaultValue(true);
        hotel.HasIndex(x => x.Name);
        hotel.HasIndex(x => new { x.Country, x.City });

        var roomType = modelBuilder.Entity<RoomType>();
        roomType.HasKey(x => x.Id);
        roomType.Property(x => x.Code).HasMaxLength(40).IsRequired();
        roomType.Property(x => x.Name).HasMaxLength(200).IsRequired();
        roomType.Property(x => x.MaxOccupancy).IsRequired();
        roomType.HasIndex(x => new { x.HotelId, x.Code }).IsUnique();
        roomType.HasOne(x => x.Hotel).WithMany(x => x.RoomTypes).HasForeignKey(x => x.HotelId);

        var inventory = modelBuilder.Entity<InventoryEntry>();
        inventory.HasKey(x => x.Id);
        inventory.Property(x => x.Date).IsRequired();
        inventory.Property(x => x.TotalUnits).IsRequired();
        inventory.Property(x => x.AvailableUnits).IsRequired();
        inventory.HasIndex(x => new { x.HotelId, x.RoomTypeId, x.Date }).IsUnique();
        inventory.HasOne(x => x.Hotel).WithMany(x => x.InventoryEntries).HasForeignKey(x => x.HotelId);
        inventory.HasOne(x => x.RoomType)
            .WithMany(x => x.InventoryEntries)
            .HasForeignKey(x => x.RoomTypeId)
            .OnDelete(DeleteBehavior.NoAction);

        var reservation = modelBuilder.Entity<Reservation>();
        reservation.HasKey(x => x.Id);
        reservation.Property(x => x.Reference).HasMaxLength(40).IsRequired();
        reservation.Property(x => x.GuestName).HasMaxLength(200).IsRequired();
        reservation.Property(x => x.GuestEmail).HasMaxLength(240);
        reservation.Property(x => x.Status).HasMaxLength(40).IsRequired();
        reservation.Property(x => x.CheckIn).IsRequired();
        reservation.Property(x => x.CheckOut).IsRequired();
        reservation.HasIndex(x => x.Reference).IsUnique();
        reservation.HasIndex(x => new { x.HotelId, x.CheckIn });
        reservation.HasOne(x => x.Hotel).WithMany(x => x.Reservations).HasForeignKey(x => x.HotelId);
        reservation.HasOne(x => x.RoomType)
            .WithMany(x => x.Reservations)
            .HasForeignKey(x => x.RoomTypeId)
            .OnDelete(DeleteBehavior.NoAction);

        var user = modelBuilder.Entity<User>();
        user.HasKey(x => x.Id);
        user.Property(x => x.Email).HasMaxLength(240).IsRequired();
        user.Property(x => x.PasswordHash).HasMaxLength(200).IsRequired();
        user.Property(x => x.Role).HasMaxLength(40).IsRequired();
        user.Property(x => x.IsActive).HasDefaultValue(true);
        user.HasIndex(x => x.Email).IsUnique();
        user.HasOne(x => x.Hotel)
            .WithMany()
            .HasForeignKey(x => x.HotelId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}

