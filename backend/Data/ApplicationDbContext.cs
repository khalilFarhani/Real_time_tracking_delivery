using Microsoft.EntityFrameworkCore;
using AxiaLivraisonAPI.Models;

namespace AxiaLivraisonAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Utilisateur> Utilisateurs { get; set; }
        public DbSet<Fournisseur> Fournisseurs { get; set; }
        public DbSet<Commande> Commandes { get; set; }
        public DbSet<Rapport> Rapports { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<UtilisateurPermission> UtilisateurPermissions { get; set; }
        // Data/ApplicationDbContext.cs
        public DbSet<Notification> Notifications { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configuration de la table de jointure
            modelBuilder.Entity<UtilisateurPermission>()
                .HasKey(up => new { up.UtilisateurId, up.PermissionId });

            modelBuilder.Entity<UtilisateurPermission>()
                .HasOne(up => up.Utilisateur)
                .WithMany(u => u.UtilisateurPermissions)
                .HasForeignKey(up => up.UtilisateurId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UtilisateurPermission>()
                .HasOne(up => up.Permission)
                .WithMany(p => p.UtilisateurPermissions)
                .HasForeignKey(up => up.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Nom des tables
            modelBuilder.Entity<Fournisseur>().ToTable("Fournisseur");
            modelBuilder.Entity<Utilisateur>().ToTable("Utilisateur");
            modelBuilder.Entity<Notification>().ToTable("Notification");
            modelBuilder.Entity<Commande>().ToTable("Commande");
            modelBuilder.Entity<Permission>().ToTable("Permission");
            modelBuilder.Entity<UtilisateurPermission>().ToTable("UtilisateurPermission");
        }
    }
}