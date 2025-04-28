using System.ComponentModel.DataAnnotations;

namespace AxiaLivraisonAPI.Models
{
    public class Permission
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string PermissionName { get; set; }

        [MaxLength(255)]
        public string Description { get; set; }

        public ICollection<UtilisateurPermission> UtilisateurPermissions { get; set; }
    }
}