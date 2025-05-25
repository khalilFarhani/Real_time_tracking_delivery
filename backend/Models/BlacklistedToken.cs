using System.ComponentModel.DataAnnotations;

namespace AxiaLivraisonAPI.Models
{
    public class BlacklistedToken
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string TokenId { get; set; } // JWT ID (jti claim)

        [Required]
        public DateTime BlacklistedDate { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime ExpiryDate { get; set; }

        public string? Reason { get; set; }

        public int? UtilisateurId { get; set; }

        // Navigation property
        public Utilisateur? Utilisateur { get; set; }
    }
}
