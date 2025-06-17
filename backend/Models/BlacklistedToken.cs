// Importer les annotations de données pour valider les propriétés
using System.ComponentModel.DataAnnotations;

// Définir l'espace de noms pour les modèles de données
namespace AxiaLivraisonAPI.Models
{
    // Classe qui représente un token blacklisté (interdit) dans la base de données
    public class BlacklistedToken
    {
        // Clé primaire de la table blacklisted token (auto-incrémentée)
        [Key]
        public int Id { get; set; }

        // ID unique du token JWT (claim jti) qui est blacklisté (obligatoire)
        [Required]
        public string TokenId { get; set; } // JWT ID (jti claim)

        // Date à laquelle le token a été blacklisté (obligatoire, par défaut: maintenant en UTC)
        [Required]
        public DateTime BlacklistedDate { get; set; } = DateTime.UtcNow;

        // Date d'expiration originale du token (obligatoire)
        [Required]
        public DateTime ExpiryDate { get; set; }

        // Raison pour laquelle le token a été blacklisté (optionnel)
        public string? Reason { get; set; }

        // ID de l'utilisateur propriétaire du token blacklisté (optionnel)
        public int? UtilisateurId { get; set; }

        // Propriété de navigation vers l'utilisateur propriétaire (optionnel)
        public Utilisateur? Utilisateur { get; set; }
    }
}
