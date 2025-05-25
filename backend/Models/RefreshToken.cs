using System.ComponentModel.DataAnnotations;

namespace AxiaLivraisonAPI.Models
{
    public class RefreshToken
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Token { get; set; }

        [Required]
        public int UtilisateurId { get; set; }

        [Required]
        public DateTime ExpiryDate { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public bool IsRevoked { get; set; } = false;

        public DateTime? RevokedDate { get; set; }

        public string? RevokedByIp { get; set; }

        public string? ReplacedByToken { get; set; }

        // Navigation property
        public Utilisateur Utilisateur { get; set; }

        // Helper properties
        public bool IsExpired => DateTime.UtcNow >= ExpiryDate;
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}
