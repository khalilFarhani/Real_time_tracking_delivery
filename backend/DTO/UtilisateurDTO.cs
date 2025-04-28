namespace AxiaLivraisonAPI.DTO
{
    public class UtilisateurDTO
    {
        public string Nom { get; set; }
        public string Email { get; set; }
        public string Telephone { get; set; }
        public string Identifiant { get; set; }
        public string MotDePasse { get; set; }
        public bool EstAdmin { get; set; } 
        public bool EstLivreur { get; set; } 
        public IFormFile? ImageFile { get; set; }
    }
}