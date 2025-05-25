using System.ComponentModel.DataAnnotations;

namespace AxiaLivraisonAPI.DTO
{
    public class RegisterClientDTO
    {
        [Required]
        public string Nom { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Telephone { get; set; }

        [Required]
        public string Identifiant { get; set; }

        [Required]
        [MinLength(6)]
        public string MotDePasse { get; set; }
    }
}
