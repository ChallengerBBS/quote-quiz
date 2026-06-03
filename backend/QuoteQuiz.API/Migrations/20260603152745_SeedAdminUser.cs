using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuoteQuiz.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO ""Users"" (""Id"", ""Username"", ""IsAdmin"", ""IsActive"", ""CreatedAt"")
                VALUES (1337, 'Administrator', true, true, '2026-06-03 00:00:00Z')
                ON CONFLICT (""Id"") DO NOTHING;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""Users"" WHERE ""Id"" = 1337;");
        }
    }
}
