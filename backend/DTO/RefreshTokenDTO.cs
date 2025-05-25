using System.ComponentModel.DataAnnotations;

namespace AxiaLivraisonAPI.DTO
{
    public class RefreshTokenDTO
    {
        [Required]
        public string RefreshToken { get; set; }
    }
}
