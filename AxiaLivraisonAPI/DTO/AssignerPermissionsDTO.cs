namespace AxiaLivraisonAPI.DTO
{
    public class AssignerPermissionsDTO
    {
        public int UtilisateurId { get; set; }
        public List<int> PermissionIds { get; set; }
    }
}