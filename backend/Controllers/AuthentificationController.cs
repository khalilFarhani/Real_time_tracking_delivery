using AxiaLivraisonAPI.Data;
using AxiaLivraisonAPI.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace AxiaLivraisonAPI.Controllers
{
    [ApiController]
    [Route("api/authentification")]
    public class AuthentificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthentificationController(ApplicationDbContext context)
        {
            _context = context;
        }
        // POST: api/authentification/connexion
        [HttpPost("connexion")]
        public async Task<IActionResult> Connexion(LoginDTO loginDTO)
        {
            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Identifiant == loginDTO.Identifiant);

            if (utilisateur == null)
            {
                return Unauthorized("Identifiant incorrect.");
            }

            if (!BCrypt.Net.BCrypt.Verify(loginDTO.MotDePasse, utilisateur.MotDePasse))
            {
                return Unauthorized("Mot de passe incorrect.");
            }

            var permissions = await _context.UtilisateurPermissions
                .Where(up => up.UtilisateurId == utilisateur.Id)
                .Include(up => up.Permission)
                .Select(up => new
                {
                    up.Permission.PermissionName,
                    up.Permission.Description
                })
                .ToListAsync();

            // Renvoyer plus d'informations sur l'utilisateur, y compris EstLivreur
            return Ok(new
            {
                Message = "Connexion réussie !",
                UserId = utilisateur.Id,
                Nom = utilisateur.Nom,
                Email = utilisateur.Email,
                ImagePath = utilisateur.ImagePath,
                EstAdmin = utilisateur.EstAdmin,
                EstLivreur = utilisateur.EstLivreur, // Add this line to include EstLivreur
                Permissions = permissions
            });
        }

        [HttpPost("connexion-livreur")]
        public async Task<IActionResult> ConnexionLivreur(LoginDTO loginDTO)
        {
            var livreur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Identifiant == loginDTO.Identifiant && u.EstLivreur);

            if (livreur == null)
            {
                return Unauthorized("Identifiant incorrect ou vous n'êtes pas un livreur.");
            }

            if (!BCrypt.Net.BCrypt.Verify(loginDTO.MotDePasse, livreur.MotDePasse))
            {
                return Unauthorized("Mot de passe incorrect.");
            }

            var response = new
            {
                Message = "Connexion réussie !",
                UserId = livreur.Id,
                Identifiant = livreur.Identifiant,
                Nom = livreur.Nom,
                Email = livreur.Email,
                Telephone = livreur.Telephone,
                ImagePath = livreur.ImagePath,
            };

            // Log the response to check its content
            Console.WriteLine("Réponse envoyée : " + Newtonsoft.Json.JsonConvert.SerializeObject(response));

            return Ok(response);
        }

        // POST: api/authentification/deconnexion
        [HttpPost("deconnexion")]
        public IActionResult Deconnexion()
        {

            return Ok(new { Message = "Déconnexion réussie !" });
        }
    }
}