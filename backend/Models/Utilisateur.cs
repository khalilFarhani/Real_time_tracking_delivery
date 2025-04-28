using System.ComponentModel.DataAnnotations;

namespace AxiaLivraisonAPI.Models
{
    public class Utilisateur
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Nom { get; set; }

        [Required]
        [MaxLength(255)]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MaxLength(20)]
        public string Telephone { get; set; }

        [Required]
        [MaxLength(255)]
        public string Identifiant { get; set; }

        [Required]
        [MaxLength(255)]
        public string MotDePasse { get; set; }

        public bool EstAdmin { get; set; } = false;
        public bool EstLivreur { get; set; } = false;

        public string? ImagePath { get; set; }

        public ICollection<Commande> Commandes { get; set; }
        public ICollection<UtilisateurPermission> UtilisateurPermissions { get; set; }
    }
}