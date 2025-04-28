using System.ComponentModel.DataAnnotations;

namespace AxiaLivraisonAPI.Models
{
    public class Rapport
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Contenu { get; set; }

        [Required]
        public int CommandeId { get; set; }
        public Commande Commande { get; set; }
    }
}