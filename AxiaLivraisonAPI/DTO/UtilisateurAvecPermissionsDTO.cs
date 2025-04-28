using System.Collections.Generic;

namespace AxiaLivraisonAPI.DTO
{
    public class UtilisateurAvecPermissionsDTO
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public string Email { get; set; }
        public List<PermissionDTO> Permissions { get; set; }
    }
}