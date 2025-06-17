// Importer les annotations de données pour valider les propriétés
using System.ComponentModel.DataAnnotations;

// Définir l'espace de noms pour les modèles de données
namespace AxiaLivraisonAPI.Models
{
    // Classe qui représente un token de rafraîchissement dans la base de données
    public class RefreshToken
    {
        // Clé primaire de la table refresh token (auto-incrémentée)
        [Key]
        public int Id { get; set; }

        // Le token de rafraîchissement lui-même (obligatoire)
        [Required]
        public string Token { get; set; }

        // ID de l'utilisateur propriétaire de ce token (obligatoire)
        [Required]
        public int UtilisateurId { get; set; }

        // Date d'expiration du token (obligatoire)
        [Required]
        public DateTime ExpiryDate { get; set; }

        // Date de création du token (obligatoire, par défaut: maintenant en UTC)
        [Required]
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Indique si le token a été révoqué (par défaut: false)
        public bool IsRevoked { get; set; } = false;

        // Date à laquelle le token a été révoqué (optionnel)
        public DateTime? RevokedDate { get; set; }

        // Adresse IP qui a révoqué le token (optionnel)
        public string? RevokedByIp { get; set; }

        // Token qui a remplacé celui-ci lors de la révocation (optionnel)
        public string? ReplacedByToken { get; set; }

        // Propriété de navigation vers l'utilisateur propriétaire
        public Utilisateur Utilisateur { get; set; }

        // Propriétés calculées pour vérifier l'état du token
        // Vérifie si le token est expiré
        public bool IsExpired => DateTime.UtcNow >= ExpiryDate;
        // Vérifie si le token est actif (non révoqué et non expiré)
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}
