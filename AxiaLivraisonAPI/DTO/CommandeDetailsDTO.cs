namespace AxiaLivraisonAPI.DTO
{
    public class CommandeDetailsDTO
    {
        public int Id { get; set; }

        public string CodeSuivi { get; set; }
        public string Statut { get; set; }
        public string UtilisateurIdentifiant { get; set; }
        public string FournisseurIdentifiant { get; set; }
        public int Quantite { get; set; }
        public decimal MontantTotale { get; set; }
        public string AdressClient { get; set; }
        public string NomClient { get; set; }
        public string TelephoneClient { get; set; }
        public DateTime DateCreation { get; set; }
        public string Description { get; set; }
        public decimal PrixUnitaire { get; set; }
        public decimal MontantHorsTax { get; set; }
        public decimal Tva { get; set; }
        public string EmailClient { get; set; }
        public FournisseurDTO Fournisseur { get; set; }
        public UtilisateurDTO Utilisateur { get; set; }
    }
}