using System.ComponentModel.DataAnnotations;

namespace AxiaLivraisonAPI.DTO
{
    public class PermissionDTO
    {

        [Required]
        [MaxLength(255)]
        public string PermissionName { get; set; }

        [MaxLength(255)]
        public string Description { get; set; }
        public int Id { get; internal set; }
    }
}