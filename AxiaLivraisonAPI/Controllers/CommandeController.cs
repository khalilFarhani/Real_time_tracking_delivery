using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AxiaLivraisonAPI.Data;
using AxiaLivraisonAPI.DTO;
using AxiaLivraisonAPI.Models;
using QRCoder;
using System.Text.Json;


namespace AxiaLivraisonAPI.Controllers
{
    [Route("api/commandes")]
    [ApiController]
    public class CommandeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CommandeController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Commandes/liste
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

        // GET: api/Commandes/details/{id}
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
                Fournisseur = new FournisseurDTO
                {
                    Nom = fournisseur?.Nom,
                    Adresse = fournisseur?.Adresse,
                    Telephone = fournisseur?.Telephone,
                    Identifiant = fournisseur?.Identifiant
                },
                Utilisateur = new UtilisateurDTO
                {
                    Nom = utilisateur?.Nom,
                    Email = utilisateur?.Email,
                    Telephone = utilisateur?.Telephone,
                    Identifiant = utilisateur?.Identifiant
                }
            };

            return Ok(commandeDetails);
        }

        // POST: api/Commandes/ajouter
        [HttpPost("ajouter")]
        public async Task<IActionResult> CreateCommande([FromBody] CommandeDTO commandeDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Identifiant == commandeDTO.UtilisateurIdentifiant&& u.EstLivreur);
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
                Statut = "en préparation", // Statut par défaut
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
                Longitude = 0
            };

            _context.Commandes.Add(commande);
            await _context.SaveChangesAsync();

            return Ok(commande);
        }

        // PUT: api/Commandes/modifier/{id}
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
                .FirstOrDefaultAsync(u => u.Identifiant == commandeDTO.UtilisateurIdentifiant&&u.EstLivreur);
            var fournisseur = await _context.Fournisseurs
                .FirstOrDefaultAsync(f => f.Identifiant == commandeDTO.FournisseurIdentifiant);

            if (utilisateur == null || fournisseur == null)
            {
                return BadRequest("Livreur ou fournisseur non trouvé.");
            }
            decimal montantHorsTax = commandeDTO.PrixUnitaire * commandeDTO.Quantite;
            decimal montantTVA = montantHorsTax * (commandeDTO.Tva / 100);
            decimal montantTotal = montantHorsTax + montantTVA;
            // Mettre à jour les champs de la commande
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
            commande.Latitude = 0;
            commande.Longitude = 0;

            _context.Entry(commande).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommandeExists(id))
                {
                    return NotFound(new { message = "Commande non trouvée." });
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // PUT: api/Commandes/modifier-statut/{id}
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

            // Validation supplémentaire si nécessaire
            if (string.IsNullOrWhiteSpace(updateDto.Statut))
            {
                return BadRequest("Le statut ne peut pas être vide");
            }

            // Liste des statuts valides
            var statutsValides = new[] { "en préparation", "en transit", "livré" };
            if (!statutsValides.Contains(updateDto.Statut.ToLower()))
            {
                return BadRequest("Statut invalide");
            }

            // Mise à jour du statut seulement
            commande.Statut = updateDto.Statut;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Statut mis à jour avec succès" });
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommandeExists(id))
                {
                    return NotFound(new { message = "Commande non trouvée." });
                }
                else
                {
                    throw;
                }
            }
        }


        // DELETE: api/Commandes/supprimer/{id}
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

        private bool CommandeExists(int id)
        {
            return _context.Commandes.Any(e => e.Id == id);
        }

        // GET: api/commandes/details/code/{codeSuivi}
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

        // GET: api/Commandes/livreur/{userId}
        [HttpGet("livreur/{userId:int}")]
        public async Task<ActionResult<IEnumerable<CommandeDTO>>> GetCommandesByLivreurId(int userId)
        {
            // Vérifier si l'utilisateur existe et est un livreur
            var livreur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Id == userId && u.EstLivreur);

            if (livreur == null)
            {
                return NotFound(new { message = "Livreur non trouvé ou l'utilisateur n'est pas un livreur." });
            }

            // Récupérer les commandes assignées à ce livreur
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

        // POST: api/commandes/position
        [HttpPost("position")]
        public async Task<IActionResult> UpdateLocation([FromBody] LocationUpdateDTO locationUpdate)
        {
            try
            {
                // Verify if the livreur exists and is actually a delivery person
                var livreur = await _context.Utilisateurs
                    .FirstOrDefaultAsync(u => u.Id == locationUpdate.LivreurId && u.EstLivreur);

                if (livreur == null)
                {
                    return NotFound(new { message = "Livreur non trouvé" });
                }

                // Get active deliveries for this driver
                var activeDeliveries = await _context.Commandes
                    .Where(c => c.UtilisateurId == locationUpdate.LivreurId
                           && (c.Statut == "en transit" || c.Statut == "en préparation"))
                    .ToListAsync();

                foreach (var delivery in activeDeliveries)
                {
                    delivery.Latitude = locationUpdate.Latitude;
                    delivery.Longitude = locationUpdate.Longitude;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Position mise à jour avec succès" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la mise à jour de la position", error = ex.Message });
            }
        }

        // GET: api/commandes/position/{commandeId}
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

    }


    }