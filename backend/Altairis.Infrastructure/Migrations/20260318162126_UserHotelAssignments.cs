using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Altairis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UserHotelAssignments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserHotelAssignments",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    HotelId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserHotelAssignments", x => new { x.UserId, x.HotelId });
                    table.ForeignKey(
                        name: "FK_UserHotelAssignments_Hotels_HotelId",
                        column: x => x.HotelId,
                        principalTable: "Hotels",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserHotelAssignments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserHotelAssignments_HotelId",
                table: "UserHotelAssignments",
                column: "HotelId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserHotelAssignments");
        }
    }
}
