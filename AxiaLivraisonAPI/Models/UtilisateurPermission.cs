using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AxiaLivraisonAPI.Models
{
    
    public class UtilisateurPermission
    {
        [Required]
        public int UtilisateurId { get; set; }

        [ForeignKey("UtilisateurId")]
        public Utilisateur Utilisateur { get; set; }

        [Required]
        public int PermissionId { get; set; }

        [ForeignKey("PermissionId")]
        public Permission Permission { get; set; }
    }
}