using System.ComponentModel.DataAnnotations;

namespace AxiaLivraisonAPI.Models
{
    public class Commande
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string CodeSuivi { get; set; }

        public DateTime DateCreation { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(100)]
        public string Statut { get; set; }

        [Required]
        public int UtilisateurId { get; set; }

        [Required]
        public int FournisseurId { get; set; }

        public string Description { get; set; }

        [Required]
        public decimal PrixUnitaire { get; set; }

        [Required]
        public int Quantite { get; set; }

        [Required]
        public decimal MontantHorsTax { get; set; }

        [Required]
        public decimal Tva { get; set; }

        [Required]
        public decimal MontantTotale { get; set; }

        [Required]
        public string AdressClient { get; set; }

        [Required]
        [MaxLength(255)]
        public string NomClient { get; set; }

        [Required]
        [MaxLength(50)]
        public string TelephoneClient { get; set; }

        [Required]
        [EmailAddress]
        public string EmailClient { get; set; }

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        public ICollection<Rapport> Rapports { get; set; }
    }
}