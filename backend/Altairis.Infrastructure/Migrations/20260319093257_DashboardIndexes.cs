using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Altairis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DashboardIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Reservations_CreatedUtc",
                table: "Reservations",
                column: "CreatedUtc");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_HotelId_CheckIn_CheckOut",
                table: "Reservations",
                columns: new[] { "HotelId", "CheckIn", "CheckOut" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryEntries_HotelId_Date",
                table: "InventoryEntries",
                columns: new[] { "HotelId", "Date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservations_CreatedUtc",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_HotelId_CheckIn_CheckOut",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_InventoryEntries_HotelId_Date",
                table: "InventoryEntries");
        }
    }
}
