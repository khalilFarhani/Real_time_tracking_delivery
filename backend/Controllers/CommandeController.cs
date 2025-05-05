using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AxiaLivraisonAPI.Data;
using AxiaLivraisonAPI.DTO;
using AxiaLivraisonAPI.Models;
using AxiaLivraisonAPI.Services;
using Microsoft.Extensions.Logging;

namespace AxiaLivraisonAPI.Controllers
{
    [Route("api/commandes")]
    [ApiController]
    public class CommandeController : ControllerBase
    {
        private readonly ILogger<CommandeController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public CommandeController(
            ApplicationDbContext context,
            IEmailService emailService,
            ILogger<CommandeController> logger)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
        }

        [HttpGet("liste")]
        public async Task<ActionResult<IEnumerable<CommandeDTO>>> GetAllCommandes()
        {
            var commandes = await _context.Commandes
                .Select(c => new CommandeDTO
                {
                    Id = c.Id,
                    Statut = c.Statut,
                    UtilisateurIdentifiant = _context.Utilisateurs
                        .Where(u => u.Id == c.UtilisateurId && u.EstLivreur)
                        .Select(u => u.Identifiant)
                        .FirstOrDefault(),
                    FournisseurIdentifiant = _context.Fournisseurs
                        .Where(f => f.Id == c.FournisseurId)
                        .Select(f => f.Identifiant)
                        .FirstOrDefault(),
                    Quantite = c.Quantite,
                    MontantTotale = c.MontantTotale,
                    AdressClient = c.AdressClient,
                    NomClient = c.NomClient,
                    TelephoneClient = c.TelephoneClient,
                    EmailClient = c.EmailClient,
                    Description = c.Description,
                    PrixUnitaire = c.PrixUnitaire,
                    MontantHorsTax = c.MontantHorsTax,
                    Tva = c.Tva
                })
                .ToListAsync();

            return Ok(commandes);
        }

        [HttpGet("details/{id:int}")]
        public async Task<ActionResult<CommandeDetailsDTO>> GetCommandeById(int id)
        {
            var commande = await _context.Commandes
                .FirstOrDefaultAsync(c => c.Id == id);

            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée." });
            }

            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Id == commande.UtilisateurId && u.EstLivreur);
            var fournisseur = await _context.Fournisseurs
                .FirstOrDefaultAsync(f => f.Id == commande.FournisseurId);

            var commandeDetails = new CommandeDetailsDTO
            {
                Id = commande.Id,
                Statut = commande.Statut,
                UtilisateurIdentifiant = utilisateur?.Identifiant,
                FournisseurIdentifiant = fournisseur?.Identifiant,
                Quantite = commande.Quantite,
                MontantTotale = commande.MontantTotale,
                AdressClient = commande.AdressClient,
                NomClient = commande.NomClient,
                TelephoneClient = commande.TelephoneClient,
                DateCreation = commande.DateCreation,
                Description = commande.Description,
                PrixUnitaire = commande.PrixUnitaire,
                MontantHorsTax = commande.MontantHorsTax,
                Tva = commande.Tva,
                EmailClient = commande.EmailClient,
                Fournisseur = fournisseur != null ? new FournisseurDTO
                {
                    Nom = fournisseur.Nom,
                    Adresse = fournisseur.Adresse,
                    Telephone = fournisseur.Telephone,
                    Identifiant = fournisseur.Identifiant
                } : null,
                Utilisateur = utilisateur != null ? new UtilisateurDTO
                {
                    Nom = utilisateur.Nom,
                    Email = utilisateur.Email,
                    Telephone = utilisateur.Telephone,
                    Identifiant = utilisateur.Identifiant
                } : null
            };

            return Ok(commandeDetails);
        }

        [HttpPost("ajouter")]
        public async Task<IActionResult> CreateCommande([FromBody] CommandeDTO commandeDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Identifiant == commandeDTO.UtilisateurIdentifiant && u.EstLivreur);
            var fournisseur = await _context.Fournisseurs
                .FirstOrDefaultAsync(f => f.Identifiant == commandeDTO.FournisseurIdentifiant);

            if (utilisateur == null || fournisseur == null)
            {
                return BadRequest("Livreur ou fournisseur non trouvé.");
            }

            decimal montantHorsTax = commandeDTO.PrixUnitaire * commandeDTO.Quantite;
            decimal montantTVA = montantHorsTax * (commandeDTO.Tva / 100);
            decimal montantTotal = montantHorsTax + montantTVA;

            var commande = new Commande
            {
                CodeSuivi = Guid.NewGuid().ToString(),
                Statut = "en préparation",
                UtilisateurId = utilisateur.Id,
                FournisseurId = fournisseur.Id,
                PrixUnitaire = commandeDTO.PrixUnitaire,
                Quantite = commandeDTO.Quantite,
                MontantHorsTax = montantHorsTax,
                Tva = commandeDTO.Tva,
                MontantTotale = montantTotal,
                AdressClient = commandeDTO.AdressClient,
                NomClient = commandeDTO.NomClient,
                TelephoneClient = commandeDTO.TelephoneClient,
                EmailClient = commandeDTO.EmailClient,
                Description = commandeDTO.Description,
                Latitude = 0,
                Longitude = 0,
                DateCreation = DateTime.UtcNow
            };

            _context.Commandes.Add(commande);
            await _context.SaveChangesAsync();

            try
            {
                string emailBody = $@"
<html>
<body>
    <h2>Confirmation de commande</h2>
    <p>Bonjour {commande.NomClient},</p>
    <p>Votre commande a été enregistrée avec succès.</p>
    
    <h3>Détails de la commande:</h3>
    <ul>
        <li><strong>Code de suivi:</strong> {commande.CodeSuivi}</li>
        <li><strong>Statut:</strong> {commande.Statut}</li>
        <li><strong>Date:</strong> {commande.DateCreation:dd/MM/yyyy HH:mm}</li>
        <li><strong>Adresse:</strong> {commande.AdressClient}</li>
        <li><strong>Montant total:</strong> {commande.MontantTotale:C}</li>
    </ul>
    
    <p>Merci pour votre confiance!</p>
    <p>L'équipe Axia Livraison</p>
</body>
</html>";

                await _emailService.SendEmailAsync(
                    commande.EmailClient,
                    commande.NomClient,
                    $"Confirmation de commande #{commande.CodeSuivi}",
                    emailBody,
                    commande.Id); // Pass the command ID here

                return Ok(new
                {
                    message = "Commande créée et email envoyé avec succès",
                    commande = commande
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Commande créée mais échec d'envoi d'email");
                return Ok(new
                {
                    message = "Commande créée mais l'email n'a pas pu être envoyé",
                    commande = commande
                });
            }
        }

        [HttpPut("modifier/{id:int}")]
        public async Task<IActionResult> UpdateCommande(int id, [FromBody] CommandeDTO commandeDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var commande = await _context.Commandes.FindAsync(id);
            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée." });
            }

            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Identifiant == commandeDTO.UtilisateurIdentifiant && u.EstLivreur);
            var fournisseur = await _context.Fournisseurs
                .FirstOrDefaultAsync(f => f.Identifiant == commandeDTO.FournisseurIdentifiant);

            if (utilisateur == null || fournisseur == null)
            {
                return BadRequest("Livreur ou fournisseur non trouvé.");
            }

            decimal montantHorsTax = commandeDTO.PrixUnitaire * commandeDTO.Quantite;
            decimal montantTVA = montantHorsTax * (commandeDTO.Tva / 100);
            decimal montantTotal = montantHorsTax + montantTVA;

            commande.Statut = commandeDTO.Statut;
            commande.UtilisateurId = utilisateur.Id;
            commande.FournisseurId = fournisseur.Id;
            commande.PrixUnitaire = commandeDTO.PrixUnitaire;
            commande.Quantite = commandeDTO.Quantite;
            commande.MontantHorsTax = montantHorsTax;
            commande.Tva = commandeDTO.Tva;
            commande.MontantTotale = montantTotal;
            commande.AdressClient = commandeDTO.AdressClient;
            commande.NomClient = commandeDTO.NomClient;
            commande.TelephoneClient = commandeDTO.TelephoneClient;
            commande.EmailClient = commandeDTO.EmailClient;
            commande.Description = commandeDTO.Description;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommandeExists(id))
                {
                    return NotFound(new { message = "Commande non trouvée." });
                }
                throw;
            }
        }

        [HttpPut("modifier-statut/{id:int}")]
        public async Task<IActionResult> UpdateCommandeStatut(int id, [FromBody] UpdateStatutDTO updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var commande = await _context.Commandes.FindAsync(id);
            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée." });
            }

            if (string.IsNullOrWhiteSpace(updateDto.Statut))
            {
                return BadRequest("Le statut ne peut pas être vide");
            }

            var statutsValides = new[] { "en préparation", "en transit", "livré" };
            if (!statutsValides.Contains(updateDto.Statut.ToLower()))
            {
                return BadRequest("Statut invalide");
            }

            var ancienStatut = commande.Statut;
            commande.Statut = updateDto.Statut;

            try
            {
                await _context.SaveChangesAsync();

                if (ancienStatut != commande.Statut)
                {
                    try
                    {
                        string emailBody = $@"
                                                <html>
                                                    <body>
                                                        <h2>Mise à jour du statut de votre commande</h2>
                                                        <p>Bonjour {commande.NomClient},</p>
                                                        <p>Le statut de votre commande a été mis à jour.</p>
    
                                                        <h3>Détails :</h3>
                                                        <ul>
                                                            <li><strong>Code de suivi :</strong> {commande.CodeSuivi}</li>
                                                            <li><strong>Nouveau statut :</strong> {commande.Statut}</li>
                                                            <li><strong>Date de mise à jour :</strong> {DateTime.Now:dd/MM/yyyy HH:mm}</li>
                                                        </ul>
    
                                                        <p>Merci pour votre confiance,<br>L'équipe Axia Livraison</p>
                                                    </body>
                                                    </html>";

                        await _emailService.SendEmailAsync(
                            commande.EmailClient,
                            commande.NomClient,
                            $"Mise à jour de votre commande #{commande.CodeSuivi}",
                            emailBody,
                            commande.Id);

                        _logger.LogInformation($"Email de mise à jour envoyé à {commande.EmailClient}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erreur lors de l'envoi de l'email");
                    }
                }

                return Ok(new
                {
                    message = "Statut mis à jour avec succès",
                    ancienStatut = ancienStatut,
                    nouveauStatut = commande.Statut
                });
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Erreur de concurrence lors de la mise à jour du statut");
                if (!CommandeExists(id))
                {
                    return NotFound(new { message = "Commande non trouvée." });
                }
                throw;
            }
        }

        [HttpDelete("supprimer/{id:int}")]
        public async Task<IActionResult> DeleteCommande(int id)
        {
            var commande = await _context.Commandes.FindAsync(id);
            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée." });
            }

            _context.Commandes.Remove(commande);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("details/code/{codeSuivi}")]
        public async Task<ActionResult<CommandeDetailsDTO>> GetCommandeByCodeSuivi(string codeSuivi)
        {
            var commande = await _context.Commandes
                .FirstOrDefaultAsync(c => c.CodeSuivi == codeSuivi);

            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée" });
            }

            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Id == commande.UtilisateurId && u.EstLivreur);
            var fournisseur = await _context.Fournisseurs
                .FirstOrDefaultAsync(f => f.Id == commande.FournisseurId);

            var commandeDetails = new CommandeDetailsDTO
            {
                Id = commande.Id,
                CodeSuivi = commande.CodeSuivi,
                Statut = commande.Statut,
                UtilisateurIdentifiant = utilisateur?.Identifiant,
                FournisseurIdentifiant = fournisseur?.Identifiant,
                Quantite = commande.Quantite,
                MontantTotale = commande.MontantTotale,
                AdressClient = commande.AdressClient,
                NomClient = commande.NomClient,
                TelephoneClient = commande.TelephoneClient,
                DateCreation = commande.DateCreation,
                Description = commande.Description,
                PrixUnitaire = commande.PrixUnitaire,
                MontantHorsTax = commande.MontantHorsTax,
                Tva = commande.Tva,
                EmailClient = commande.EmailClient,
                Fournisseur = fournisseur != null ? new FournisseurDTO
                {
                    Nom = fournisseur.Nom,
                    Adresse = fournisseur.Adresse,
                    Telephone = fournisseur.Telephone,
                    Identifiant = fournisseur.Identifiant
                } : null,
                Utilisateur = utilisateur != null ? new UtilisateurDTO
                {
                    Nom = utilisateur.Nom,
                    Email = utilisateur.Email,
                    Telephone = utilisateur.Telephone,
                    Identifiant = utilisateur.Identifiant
                } : null
            };

            return Ok(commandeDetails);
        }

        [HttpGet("livreur/{userId:int}")]
        public async Task<ActionResult<IEnumerable<CommandeDTO>>> GetCommandesByLivreurId(int userId)
        {
            var livreur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Id == userId && u.EstLivreur);

            if (livreur == null)
            {
                return NotFound(new { message = "Livreur non trouvé ou l'utilisateur n'est pas un livreur." });
            }

            var commandes = await _context.Commandes
                .Where(c => c.UtilisateurId == userId)
                .Select(c => new CommandeDetailsDTO
                {
                    Id = c.Id,
                    CodeSuivi = c.CodeSuivi,
                    Statut = c.Statut,
                    UtilisateurIdentifiant = livreur.Identifiant,
                    FournisseurIdentifiant = _context.Fournisseurs
                        .Where(f => f.Id == c.FournisseurId)
                        .Select(f => f.Identifiant)
                        .FirstOrDefault(),
                    Quantite = c.Quantite,
                    MontantTotale = c.MontantTotale,
                    AdressClient = c.AdressClient,
                    NomClient = c.NomClient,
                    TelephoneClient = c.TelephoneClient,
                    EmailClient = c.EmailClient,
                    Description = c.Description,
                    PrixUnitaire = c.PrixUnitaire,
                    MontantHorsTax = c.MontantHorsTax,
                    Tva = c.Tva,
                    DateCreation = c.DateCreation
                })
                .OrderByDescending(c => c.DateCreation)
                .ToListAsync();

            return Ok(commandes);
        }

        [HttpPost("position")]
        public async Task<IActionResult> UpdateLocation([FromBody] LocationUpdateDTO locationUpdate)
        {
            try
            {
                var livreur = await _context.Utilisateurs
                    .FirstOrDefaultAsync(u => u.Id == locationUpdate.LivreurId && u.EstLivreur);

                if (livreur == null)
                {
                    return NotFound(new { message = "Livreur non trouvé" });
                }

                var activeDeliveries = await _context.Commandes
                    .Where(c => c.UtilisateurId == locationUpdate.LivreurId
                           && (c.Statut == "en transit" || c.Statut == "en préparation"))
                    .ToListAsync();

                if (activeDeliveries.Any())
                {
                    foreach (var delivery in activeDeliveries)
                    {
                        delivery.Latitude = locationUpdate.Latitude;
                        delivery.Longitude = locationUpdate.Longitude;
                    }

                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    message = "Position mise à jour avec succès",
                    updatedDeliveries = activeDeliveries.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Erreur lors de la mise à jour de la position",
                    error = ex.Message
                });
            }
        }

        [HttpGet("position/{commandeId:int}")]
        public async Task<ActionResult<object>> GetDeliveryLocation(int commandeId)
        {
            var commande = await _context.Commandes
                .Where(c => c.Id == commandeId)
                .Select(c => new { c.Latitude, c.Longitude, c.Statut })
                .FirstOrDefaultAsync();

            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée" });
            }

            return Ok(commande);
        }

        [HttpGet("position/code/{codeSuivi}")]
        public async Task<ActionResult<object>> GetDeliveryLocationByCode(string codeSuivi)
        {
            var commande = await _context.Commandes
                .Where(c => c.CodeSuivi == codeSuivi)
                .Select(c => new { c.Latitude, c.Longitude, c.Statut })
                .FirstOrDefaultAsync();

            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée" });
            }

            return Ok(commande);
        }

        private bool CommandeExists(int id)
        {
            return _context.Commandes.Any(e => e.Id == id);
        }
    }
}