using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AxiaLivraisonAPI.Models
{
    public class Fournisseur
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Nom { get; set; }

        [Required]
        public string Adresse { get; set; }

        [Required]
        [MaxLength(20)]
        public string Telephone { get; set; }

        [Required]
        [MaxLength(50)] 
        public string Identifiant { get; set; }

        public ICollection<Commande> Commandes { get; set; }
    }
}
