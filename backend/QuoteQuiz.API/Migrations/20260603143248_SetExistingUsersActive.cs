using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuoteQuiz.API.Migrations
{
    /// <inheritdoc />
    public partial class SetExistingUsersActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE \"Users\" SET \"IsActive\" = TRUE WHERE \"IsActive\" = FALSE;");
            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Users",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldDefaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Users",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldDefaultValue: true);
        }
    }
}
