using AxiaLivraisonAPI.Data;
using AxiaLivraisonAPI.DTO;
using AxiaLivraisonAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Linq;
using AxiaLivraisonAPI.Models;

namespace AxiaLivraisonAPI.Controllers
{
    [Route("api/utilisateurs")]
    [ApiController]
    public class UtilisateurController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public UtilisateurController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }
        // GET: api/utilisateurs/identifiants
        [HttpGet("identifiants")]
        public async Task<ActionResult<IEnumerable<string>>> GetUtilisateurIdentifiants()
        {
            return await _context.Utilisateurs
                .Where(u => u.EstAdmin == false && u.EstLivreur == true) // Only regular users
                .Select(u => u.Identifiant)
                .ToListAsync();
        }

        // GET: api/utilisateurs/liste
        [HttpGet("liste")]
        public async Task<ActionResult<IEnumerable<Utilisateur>>> GetAllUtilisateurs()
        {
            return await _context.Utilisateurs
                         .Where(u => u.EstAdmin == false && u.EstLivreur == false) // Only regular users
                         .ToListAsync();
        }

        // GET: api/utilisateurs/livreurs
        [HttpGet("livreurs")]
        public async Task<ActionResult<IEnumerable<Utilisateur>>> GetLivreurs()
        {
            return await _context.Utilisateurs
                         .Where(u => u.EstAdmin == false && u.EstLivreur == true) // Only delivery persons
                         .ToListAsync();
        }

        // GET: api/utilisateurs/details/{id}
        [HttpGet("details/{id:int}")]
        public async Task<ActionResult<Utilisateur>> GetUtilisateurById(int id)
        {
            var utilisateur = await _context.Utilisateurs.FindAsync(id);
            if (utilisateur == null)
            {
                return NotFound(new { message = "Utilisateur non trouvé." });
            }
            return utilisateur;
        }

        // POST: api/utilisateurs/ajouter
        [HttpPost("ajouter")]
        public async Task<IActionResult> CreateUtilisateur([FromForm] UtilisateurDTO utilisateurDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var utilisateur = new Utilisateur
            {
                Nom = utilisateurDTO.Nom,
                Email = utilisateurDTO.Email,
                Telephone = utilisateurDTO.Telephone,
                Identifiant = utilisateurDTO.Identifiant,
                MotDePasse = utilisateurDTO.MotDePasse,
                EstAdmin = false,
                EstLivreur = false
            };

            if (utilisateurDTO.ImageFile != null && utilisateurDTO.ImageFile.Length > 0)
            {
                if (!IsImageFile(utilisateurDTO.ImageFile))
                {
                    return BadRequest(new { message = "Le fichier doit être une image (jpg, jpeg, png)." });
                }

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(utilisateurDTO.ImageFile.FileName);
                var filePath = Path.Combine(_env.WebRootPath, "images", fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await utilisateurDTO.ImageFile.CopyToAsync(stream);
                }

                utilisateur.ImagePath = $"/images/{fileName}";
            }

            _context.Utilisateurs.Add(utilisateur);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUtilisateurById), new { id = utilisateur.Id }, utilisateur);
        }

        // POST: api/utilisateurs/ajouter-livreur
        [HttpPost("ajouter-livreur")]
        public async Task<IActionResult> CreateLivreur([FromForm] UtilisateurDTO utilisateurDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var livreur = new Utilisateur
            {
                Nom = utilisateurDTO.Nom,
                Email = utilisateurDTO.Email,
                Telephone = utilisateurDTO.Telephone,
                Identifiant = utilisateurDTO.Identifiant,
                MotDePasse = utilisateurDTO.MotDePasse,
                EstAdmin = false, // Automatically set to false
                EstLivreur = true // Automatically set to true
            };

            if (utilisateurDTO.ImageFile != null && utilisateurDTO.ImageFile.Length > 0)
            {
                if (!IsImageFile(utilisateurDTO.ImageFile))
                {
                    return BadRequest(new { message = "Le fichier doit être une image (jpg, jpeg, png)." });
                }

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(utilisateurDTO.ImageFile.FileName);
                var filePath = Path.Combine(_env.WebRootPath, "images", fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await utilisateurDTO.ImageFile.CopyToAsync(stream);
                }

                livreur.ImagePath = $"/images/{fileName}";
            }

            _context.Utilisateurs.Add(livreur);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLivreurs), new { id = livreur.Id }, livreur);
        }

        // PUT: api/utilisateurs/modifier/{id}
        [HttpPut("modifier/{id:int}")]
        public async Task<IActionResult> UpdateUtilisateur(int id, [FromForm] UtilisateurDTO utilisateurDTO)
        {
            var utilisateur = await _context.Utilisateurs.FindAsync(id);
            if (utilisateur == null)
            {
                return NotFound(new { message = "Utilisateur non trouvé." });
            }

            // Update fields
            utilisateur.Nom = utilisateurDTO.Nom;
            utilisateur.Email = utilisateurDTO.Email;
            utilisateur.Telephone = utilisateurDTO.Telephone;
            utilisateur.Identifiant = utilisateurDTO.Identifiant;
            utilisateur.MotDePasse = utilisateurDTO.MotDePasse;

            // Handle image upload
            if (utilisateurDTO.ImageFile != null && utilisateurDTO.ImageFile.Length > 0)
            {
                if (!IsImageFile(utilisateurDTO.ImageFile))
                {
                    return BadRequest(new { message = "Le fichier doit être une image (jpg, jpeg, png)." });
                }

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(utilisateurDTO.ImageFile.FileName);
                var filePath = Path.Combine(_env.WebRootPath, "images", fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await utilisateurDTO.ImageFile.CopyToAsync(stream);
                }

                // Delete old image if it exists
                if (!string.IsNullOrEmpty(utilisateur.ImagePath))
                {
                    var oldFilePath = Path.Combine(_env.WebRootPath, utilisateur.ImagePath.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                // Update image path
                utilisateur.ImagePath = $"/images/{fileName}";
            }


            _context.Entry(utilisateur).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UtilisateurExists(id))
                {
                    return NotFound(new { message = "Utilisateur non trouvé." });
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/utilisateurs/supprimer/{id}
        [HttpDelete("supprimer/{id:int}")]
        public async Task<IActionResult> DeleteUtilisateur(int id)
        {
            var utilisateur = await _context.Utilisateurs.FindAsync(id);
            if (utilisateur == null)
            {
                return NotFound(new { message = "Utilisateur non trouvé." });
            }

            // Delete associated image if it exists
            if (!string.IsNullOrEmpty(utilisateur.ImagePath))
            {
                var filePath = Path.Combine(_env.WebRootPath, utilisateur.ImagePath.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            _context.Utilisateurs.Remove(utilisateur);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        private bool UtilisateurExists(int id)
        {
            return _context.Utilisateurs.Any(e => e.Id == id);
        }

        private bool IsImageFile(IFormFile file)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            return allowedExtensions.Contains(fileExtension);
        }

        // GET: api/utilisateurs/details-livreur/{identifiant}
        [HttpGet("details-livreur/{identifiant}")]
        public async Task<ActionResult<LivreurDetailsDTO>> GetUtilisateurInfoByIdentifiant(string identifiant)
        {
            var utilisateur = await _context.Utilisateurs
                .Where(u => u.Identifiant == identifiant)
                .Select(u => new LivreurDetailsDTO
                {
                    Nom = u.Nom,
                    Email = u.Email,
                    Telephone = u.Telephone
                })
                .FirstOrDefaultAsync();

            if (utilisateur == null)
            {
                return NotFound(new { message = "Livreur non trouvé." });
            }

            return utilisateur;
        }

      
        public class LivreurDetailsDTO
        {
            public string Nom { get; set; }
            public string Email { get; set; }
            public string Telephone { get; set; }
        }

        // Ajouter ce nouvel endpoint
        [HttpGet("avec-permissions")]
        public async Task<ActionResult<IEnumerable<UtilisateurAvecPermissionsDTO>>> GetUtilisateursAvecPermissions()
        {
            var utilisateurs = await _context.Utilisateurs
                .Select(u => new UtilisateurAvecPermissionsDTO
                {
                    Id = u.Id,
                    Nom = u.Nom,
                    Email = u.Email,
                    Permissions = u.UtilisateurPermissions.Select(up => new PermissionDTO
                    {
                        Id = up.Permission.Id,
                        PermissionName = up.Permission.PermissionName,
                        Description = up.Permission.Description
                    }).ToList()
                })
                .ToListAsync();

            return Ok(utilisateurs);
        }
    }
}