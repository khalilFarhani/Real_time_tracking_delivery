using System.ComponentModel.DataAnnotations;

public class FournisseurDTO
{
    [Required]
    public string Nom { get; set; }

    [Required]
    public string Adresse { get; set; }

    [Required]
    [Phone]
    public string Telephone { get; set; }

    [Required]
    [MaxLength(50)]
    public string Identifiant { get; set; } // Ensure this property is included
}