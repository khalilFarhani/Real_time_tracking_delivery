using AxiaLivraisonAPI.Data;
using AxiaLivraisonAPI.DTO;
using AxiaLivraisonAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AxiaLivraisonAPI.Controllers
{
    [ApiController]
    [Route("api/fournisseurs")]
    public class FournisseurController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FournisseurController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/fournisseurs/liste
        [HttpGet("liste")]
        public async Task<ActionResult<IEnumerable<Fournisseur>>> GetAllFournisseurs()
        {
            return await _context.Fournisseurs.ToListAsync();
        }

        // GET: api/fournisseurs/identifiants
        [HttpGet("identifiants")]
        public async Task<ActionResult<IEnumerable<string>>> GetFournisseurIdentifiants()
        {
            return await _context.Fournisseurs
                .Select(f => f.Identifiant)
                .ToListAsync();
        }

        // GET: api/fournisseurs/details/{id}
        [HttpGet("details/{id:int}")]
        public async Task<ActionResult<Fournisseur>> GetFournisseurById(int id)
        {
            var fournisseur = await _context.Fournisseurs.FindAsync(id);

            if (fournisseur == null)
            {
                return NotFound(new { message = "Fournisseur non trouvé." });
            }

            return fournisseur;
        }

        // POST: api/fournisseurs/ajouter
        [HttpPost("ajouter")]
        public async Task<IActionResult> CreateFournisseur([FromBody] FournisseurDTO fournisseurDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var fournisseur = new Fournisseur
            {
                Nom = fournisseurDTO.Nom,
                Adresse = fournisseurDTO.Adresse,
                Telephone = fournisseurDTO.Telephone,
                Identifiant = fournisseurDTO.Identifiant,
                DateCreation = DateTime.UtcNow // Ajout automatique de la date actuelle
            };

            _context.Fournisseurs.Add(fournisseur);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFournisseurById), new { id = fournisseur.Id }, fournisseur);
        }

        // PUT: api/fournisseurs/modifier/{id}
        [HttpPut("modifier/{id:int}")]
        public async Task<IActionResult> UpdateFournisseur(int id, [FromBody] FournisseurDTO fournisseurDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var fournisseur = await _context.Fournisseurs.FindAsync(id);
            if (fournisseur == null)
            {
                return NotFound(new { message = "Fournisseur non trouvé." });
            }

            // Update the properties
            fournisseur.Nom = fournisseurDTO.Nom;
            fournisseur.Adresse = fournisseurDTO.Adresse;
            fournisseur.Telephone = fournisseurDTO.Telephone;
            fournisseur.Identifiant = fournisseurDTO.Identifiant;

            _context.Entry(fournisseur).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FournisseurExists(id))
                {
                    return NotFound(new { message = "Fournisseur non trouvé." });
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }
        // DELETE: api/fournisseurs/supprimer/{id}
        [HttpDelete("supprimer/{id:int}")]
        public async Task<IActionResult> DeleteFournisseur(int id)
        {
            var fournisseur = await _context.Fournisseurs.FindAsync(id);
            if (fournisseur == null)
            {
                return NotFound(new { message = "Fournisseur non trouvé." });
            }

            try
            {
                // Check if there are any commandes associated with this fournisseur
                var hasCommandes = await _context.Commandes
                    .AnyAsync(c => c.FournisseurId == id);

                if (hasCommandes)
                {
                    return BadRequest(new
                    {
                        message = "Impossible de supprimer ce fournisseur",
                        details = "Ce fournisseur est associé à une ou plusieurs commandes. Veuillez d'abord supprimer ces commandes."
                    });
                }

                // If no commandes, it's safe to delete
                _context.Fournisseurs.Remove(fournisseur);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Erreur lors de la suppression du fournisseur",
                    details = "Ce fournisseur ne peut pas être supprimé car il est référencé par d'autres éléments du système."
                });
            }
        }
        // DELETE: api/fournisseurs/supprimer-avec-commandes/{id}
        [HttpDelete("supprimer-avec-commandes/{id:int}")]
        public async Task<IActionResult> DeleteFournisseurWithCommandes(int id)
        {
            var fournisseur = await _context.Fournisseurs.FindAsync(id);
            if (fournisseur == null)
            {
                return NotFound(new { message = "Fournisseur non trouvé." });
            }

            try
            {
                // Trouver toutes les commandes associées à ce fournisseur
                var commandes = await _context.Commandes
                    .Where(c => c.FournisseurId == id)
                    .ToListAsync();

                // Supprimer d'abord les notifications liées aux commandes
                foreach (var commande in commandes)
                {
                    var notifications = await _context.Notifications
                        .Where(n => n.CommandeId == commande.Id)
                        .ToListAsync();

                    if (notifications.Any())
                    {
                        _context.Notifications.RemoveRange(notifications);
                    }
                }

                // Ensuite supprimer les commandes
                if (commandes.Any())
                {
                    _context.Commandes.RemoveRange(commandes);
                }

                // Enfin, supprimer le fournisseur
                _context.Fournisseurs.Remove(fournisseur);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Fournisseur et ses commandes supprimés avec succès",
                    commandesCount = commandes.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Erreur lors de la suppression du fournisseur et de ses commandes",
                    details = ex.Message
                });
            }
        }

        private bool FournisseurExists(int id)
        {
            return _context.Fournisseurs.Any(e => e.Id == id);
        }
    }
}