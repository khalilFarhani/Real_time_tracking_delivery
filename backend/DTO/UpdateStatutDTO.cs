using System.ComponentModel.DataAnnotations;

namespace AxiaLivraisonAPI.DTO
{
    public class UpdateStatutDTO
    {
        [Required]
        public string Statut { get; set; }
    }
}
