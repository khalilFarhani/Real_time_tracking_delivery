namespace AxiaLivraisonAPI.DTO
{
    public class CommandeDTO
    {
        public int Id { get; set; }
        public string Statut { get; set; }
        public string UtilisateurIdentifiant { get; set; }
        public string FournisseurIdentifiant { get; set; }
        public string Description { get; set; }
        public decimal PrixUnitaire { get; set; }
        public int Quantite { get; set; }
        public decimal MontantHorsTax { get; set; }
        public decimal Tva { get; set; }
        public decimal MontantTotale { get; set; }
        public string AdressClient { get; set; }
        public string NomClient { get; set; }
        public string TelephoneClient { get; set; }
        public string EmailClient { get; set; }
        public DateTime DateCreation { get; set; } = DateTime.UtcNow;


    }
}