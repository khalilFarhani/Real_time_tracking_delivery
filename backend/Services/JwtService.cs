using AxiaLivraisonAPI.Data;
using AxiaLivraisonAPI.Models;
using AxiaLivraisonAPI.DTO;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace AxiaLivraisonAPI.Services
{
    public class JwtService : IJwtService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<JwtService> _logger;

        public JwtService(ApplicationDbContext context, IConfiguration configuration, ILogger<JwtService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public string GenerateAccessToken(Utilisateur user, List<PermissionInfo>? permissions = null)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);
            var tokenId = Guid.NewGuid().ToString();

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, tokenId),
                new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Nom),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("identifiant", user.Identifiant),
                new Claim("estAdmin", user.EstAdmin.ToString()),
                new Claim("estLivreur", user.EstLivreur.ToString())
            };

            // Add permissions as claims
            if (permissions != null)
            {
                foreach (var permission in permissions)
                {
                    claims.Add(new Claim("permission", permission.PermissionName));
                }
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["AccessTokenExpiryMinutes"])),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public RefreshToken GenerateRefreshToken(int userId, string? ipAddress = null)
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);

            var refreshToken = new RefreshToken
            {
                Token = Convert.ToBase64String(randomBytes),
                UtilisateurId = userId,
                ExpiryDate = DateTime.UtcNow.AddDays(double.Parse(_configuration.GetSection("JwtSettings")["RefreshTokenExpiryDays"])),
                CreatedDate = DateTime.UtcNow
            };

            return refreshToken;
        }

        public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateLifetime = false, // Don't validate expiry for refresh token scenario
                ValidIssuer = jwtSettings["Issuer"],
                ValidAudience = jwtSettings["Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);

                if (validatedToken is not JwtSecurityToken jwtToken ||
                    !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return null;
                }

                return principal;
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> IsTokenBlacklistedAsync(string tokenId)
        {
            // Temporairement désactivé jusqu'à la migration
            return await Task.FromResult(false);
        }

        public async Task BlacklistTokenAsync(string tokenId, DateTime expiry, string? reason = null, int? userId = null)
        {
            // Temporairement désactivé jusqu'à la migration
            await Task.CompletedTask;
        }

        public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
        {
            // Temporairement désactivé jusqu'à la migration
            return await Task.FromResult<RefreshToken?>(null);
        }

        public async Task RevokeRefreshTokenAsync(RefreshToken refreshToken, string? ipAddress = null, string? reason = null, string? replacedByToken = null)
        {
            // Temporairement désactivé jusqu'à la migration
            await Task.CompletedTask;
        }

        public async Task<bool> ValidateRefreshTokenAsync(string token)
        {
            // Temporairement désactivé jusqu'à la migration
            return await Task.FromResult(false);
        }

        public async Task CleanupExpiredTokensAsync()
        {
            // Temporairement désactivé jusqu'à la migration
            await Task.CompletedTask;
        }
    }
}
