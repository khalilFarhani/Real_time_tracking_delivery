using AxiaLivraisonAPI.Data;
using AxiaLivraisonAPI.DTO;
using AxiaLivraisonAPI.Models;
using AxiaLivraisonAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace AxiaLivraisonAPI.Controllers
{
    // Marquer cette classe comme contr�leur d'API
    [ApiController]
    // D�finir la route de base pour ce contr�leur
    [Route("api/authentification")]
    // Contr�leur qui g�re l'authentification des utilisateurs
    public class AuthentificationController : ControllerBase
    {
        // Contexte de base de donn�es pour acc�der aux donn�es
        private readonly ApplicationDbContext _context;
        // Service JWT pour g�rer les tokens
        private readonly IJwtService _jwtService;

        // Constructeur qui re�oit les d�pendances par injection
        public AuthentificationController(ApplicationDbContext context, IJwtService jwtService)
        {
            // Initialiser le contexte de base de donn�es
            _context = context;
            // Initialiser le service JWT
            _jwtService = jwtService;
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
                .Select(up => new PermissionInfo
                {
                    PermissionName = up.Permission.PermissionName,
                    Description = up.Permission.Description
                })
                .ToListAsync();

            // Generate JWT tokens
            var accessToken = _jwtService.GenerateAccessToken(utilisateur, permissions);
            var refreshToken = _jwtService.GenerateRefreshToken(utilisateur.Id, GetIpAddress());

            // Temporairement : ne pas sauvegarder en base jusqu'� la migration
            // _context.RefreshTokens.Add(refreshToken);
            // await _context.SaveChangesAsync();

            var response = new AuthResponseDTO
            {
                Message = "Connexion r�ussie !",
                UserId = utilisateur.Id,
                Nom = utilisateur.Nom,
                Email = utilisateur.Email,
                ImagePath = utilisateur.ImagePath,
                EstAdmin = utilisateur.EstAdmin,
                EstLivreur = utilisateur.EstLivreur,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                TokenExpiry = DateTime.UtcNow.AddMinutes(60), // Should match JWT settings
                Permissions = permissions
            };

            return Ok(response);
        }

        [HttpPost("connexion-livreur")]
        public async Task<IActionResult> ConnexionLivreur(LoginDTO loginDTO)
        {
            var livreur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Identifiant == loginDTO.Identifiant && u.EstLivreur);

            if (livreur == null)
            {
                return Unauthorized("Identifiant incorrect ou vous n'�tes pas un livreur.");
            }

            if (!BCrypt.Net.BCrypt.Verify(loginDTO.MotDePasse, livreur.MotDePasse))
            {
                return Unauthorized("Mot de passe incorrect.");
            }

            // Generate JWT tokens for livreur
            var accessToken = _jwtService.GenerateAccessToken(livreur);
            var refreshToken = _jwtService.GenerateRefreshToken(livreur.Id, GetIpAddress());

            // Temporairement : ne pas sauvegarder en base jusqu'� la migration
            // _context.RefreshTokens.Add(refreshToken);
            // await _context.SaveChangesAsync();

            var response = new AuthResponseDTO
            {
                Message = "Connexion r�ussie !",
                UserId = livreur.Id,
                Nom = livreur.Nom,
                Email = livreur.Email,
                ImagePath = livreur.ImagePath,
                EstAdmin = livreur.EstAdmin,
                EstLivreur = livreur.EstLivreur,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                TokenExpiry = DateTime.UtcNow.AddMinutes(60)
            };

            return Ok(response);
        }

        // POST: api/authentification/deconnexion
        [HttpPost("deconnexion")]
        [Authorize]
        public async Task<IActionResult> Deconnexion()
        {
            var token = HttpContext.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (!string.IsNullOrEmpty(token))
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                var tokenId = jwtToken.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Jti)?.Value;
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (!string.IsNullOrEmpty(tokenId))
                {
                    // Blacklist the current token
                    await _jwtService.BlacklistTokenAsync(tokenId, jwtToken.ValidTo, "User logout", int.Parse(userId ?? "0"));

                    // Temporairement d�sactiv� jusqu'� la migration
                    // var refreshTokens = await _context.RefreshTokens
                    //     .Where(rt => rt.UtilisateurId == int.Parse(userId ?? "0") && rt.IsActive)
                    //     .ToListAsync();

                    // foreach (var refreshToken in refreshTokens)
                    // {
                    //     await _jwtService.RevokeRefreshTokenAsync(refreshToken, GetIpAddress(), "User logout");
                    // }
                }
            }

            return Ok(new { Message = "D�connexion r�ussie !" });
        }

        // POST: api/authentification/refresh-token
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken(RefreshTokenDTO refreshTokenDto)
        {
            // Temporairement d�sactiv� jusqu'� la migration
            return Unauthorized("Refresh token functionality temporarily disabled until migration");
        }

        // POST: api/authentification/revoke-token
        [HttpPost("revoke-token")]
        [Authorize]
        public async Task<IActionResult> RevokeToken(RefreshTokenDTO refreshTokenDto)
        {
            // Temporairement d�sactiv� jusqu'� la migration
            return Ok(new { Message = "Token revoke functionality temporarily disabled until migration" });
        }

        // POST: api/authentification/connexion-client
        [HttpPost("connexion-client")]
        public async Task<IActionResult> ConnexionClient(LoginDTO loginDTO)
        {
            var client = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Identifiant == loginDTO.Identifiant && !u.EstAdmin && !u.EstLivreur);

            if (client == null)
            {
                return Unauthorized("Identifiant incorrect ou vous n'�tes pas un client.");
            }

            if (!BCrypt.Net.BCrypt.Verify(loginDTO.MotDePasse, client.MotDePasse))
            {
                return Unauthorized("Mot de passe incorrect.");
            }

            // Generate JWT tokens for client
            var accessToken = _jwtService.GenerateAccessToken(client);
            var refreshToken = _jwtService.GenerateRefreshToken(client.Id, GetIpAddress());

            // Temporairement d�sactiv� jusqu'� la migration
            // _context.RefreshTokens.Add(refreshToken);
            // await _context.SaveChangesAsync();

            var response = new AuthResponseDTO
            {
                Message = "Connexion r�ussie !",
                UserId = client.Id,
                Nom = client.Nom,
                Email = client.Email,
                ImagePath = client.ImagePath,
                EstAdmin = client.EstAdmin,
                EstLivreur = client.EstLivreur,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                TokenExpiry = DateTime.UtcNow.AddMinutes(60)
            };

            return Ok(response);
        }

        // POST: api/authentification/register-client
        [HttpPost("register-client")]
        public async Task<IActionResult> RegisterClient(RegisterClientDTO registerDTO)
        {
            // Check if user already exists
            var existingUser = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Identifiant == registerDTO.Identifiant || u.Email == registerDTO.Email);

            if (existingUser != null)
            {
                return BadRequest("Un utilisateur avec cet identifiant ou email existe d�j�.");
            }

            // Create new client user
            var client = new Utilisateur
            {
                Nom = registerDTO.Nom,
                Email = registerDTO.Email,
                Telephone = registerDTO.Telephone,
                Identifiant = registerDTO.Identifiant,
                MotDePasse = BCrypt.Net.BCrypt.HashPassword(registerDTO.MotDePasse),
                EstAdmin = false,
                EstLivreur = false
            };

            _context.Utilisateurs.Add(client);
            await _context.SaveChangesAsync();

            // Generate JWT tokens for new client
            var accessToken = _jwtService.GenerateAccessToken(client);
            var refreshToken = _jwtService.GenerateRefreshToken(client.Id, GetIpAddress());

            // Temporairement d�sactiv� jusqu'� la migration
            // _context.RefreshTokens.Add(refreshToken);
            // await _context.SaveChangesAsync();

            var response = new AuthResponseDTO
            {
                Message = "Inscription r�ussie !",
                UserId = client.Id,
                Nom = client.Nom,
                Email = client.Email,
                ImagePath = client.ImagePath,
                EstAdmin = client.EstAdmin,
                EstLivreur = client.EstLivreur,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                TokenExpiry = DateTime.UtcNow.AddMinutes(60)
            };

            return Ok(response);
        }

        private string GetIpAddress()
        {
            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }
    }
}