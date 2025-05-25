using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AxiaLivraisonAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddJWTAuthentication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add DateCreation column to Utilisateurs table
            migrationBuilder.AddColumn<DateTime>(
                name: "DateCreation",
                table: "Utilisateurs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc));

            // Create RefreshTokens table
            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Token = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UtilisateurId = table.Column<int>(type: "int", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false),
                    RevokedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevokedByIp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReplacedByToken = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Utilisateurs_UtilisateurId",
                        column: x => x.UtilisateurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create BlacklistedTokens table
            migrationBuilder.CreateTable(
                name: "BlacklistedTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TokenId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BlacklistedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UtilisateurId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlacklistedTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BlacklistedTokens_Utilisateurs_UtilisateurId",
                        column: x => x.UtilisateurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id");
                });

            // Create indexes for better performance
            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UtilisateurId",
                table: "RefreshTokens",
                column: "UtilisateurId");

            migrationBuilder.CreateIndex(
                name: "IX_BlacklistedTokens_UtilisateurId",
                table: "BlacklistedTokens",
                column: "UtilisateurId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens",
                column: "Token");

            migrationBuilder.CreateIndex(
                name: "IX_BlacklistedTokens_TokenId",
                table: "BlacklistedTokens",
                column: "TokenId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop tables
            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "BlacklistedTokens");

            // Remove DateCreation column
            migrationBuilder.DropColumn(
                name: "DateCreation",
                table: "Utilisateurs");
        }
    }
}
