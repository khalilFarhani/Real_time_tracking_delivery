// Importer les annotations de données pour valider les propriétés
using System.ComponentModel.DataAnnotations;

// Définir l'espace de noms pour les modèles de données
namespace AxiaLivraisonAPI.Models
{
    // Classe qui représente un utilisateur dans la base de données
    public class Utilisateur
    {
        // Clé primaire de la table utilisateur (auto-incrémentée)
        [Key]
        public int Id { get; set; }

        // Nom de l'utilisateur (obligatoire, maximum 255 caractères)
        [Required]
        [MaxLength(255)]
        public string Nom { get; set; }

        // Adresse email de l'utilisateur (obligatoire, maximum 255 caractères, format email valide)
        [Required]
        [MaxLength(255)]
        [EmailAddress]
        public string Email { get; set; }

        // Numéro de téléphone de l'utilisateur (obligatoire, maximum 20 caractères)
        [Required]
        [MaxLength(20)]
        public string Telephone { get; set; }

        // Identifiant unique pour se connecter (obligatoire, maximum 255 caractères)
        [Required]
        [MaxLength(255)]
        public string Identifiant { get; set; }

        // Mot de passe hashé de l'utilisateur (obligatoire, maximum 255 caractères)
        [Required]
        [MaxLength(255)]
        public string MotDePasse { get; set; }

        // Indique si l'utilisateur est un administrateur (par défaut: false)
        public bool EstAdmin { get; set; } = false;
        // Indique si l'utilisateur est un livreur (par défaut: false)
        public bool EstLivreur { get; set; } = false;

        // Chemin vers l'image de profil de l'utilisateur (optionnel)
        public string? ImagePath { get; set; }

        // Collection des commandes passées par cet utilisateur (relation un-à-plusieurs)
        public ICollection<Commande> Commandes { get; set; }
        // Collection des permissions accordées à cet utilisateur (relation plusieurs-à-plusieurs)
        public ICollection<UtilisateurPermission> UtilisateurPermissions { get; set; }
    }
}