namespace AxiaLivraisonAPI.DTO
{
    public class AuthResponseDTO
    {
        public string Message { get; set; }
        public int UserId { get; set; }
        public string Nom { get; set; }
        public string Email { get; set; }
        public string? ImagePath { get; set; }
        public bool EstAdmin { get; set; }
        public bool EstLivreur { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public DateTime TokenExpiry { get; set; }
        public List<PermissionInfo>? Permissions { get; set; }
    }

    public class PermissionInfo
    {
        public string PermissionName { get; set; }
        public string? Description { get; set; }
    }
}
