using AxiaLivraisonAPI.Models;
using AxiaLivraisonAPI.DTO;
using System.Security.Claims;

namespace AxiaLivraisonAPI.Services
{
    public interface IJwtService
    {
        string GenerateAccessToken(Utilisateur user, List<PermissionInfo>? permissions = null);
        RefreshToken GenerateRefreshToken(int userId, string? ipAddress = null);
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
        Task<bool> IsTokenBlacklistedAsync(string tokenId);
        Task BlacklistTokenAsync(string tokenId, DateTime expiry, string? reason = null, int? userId = null);
        Task<RefreshToken?> GetRefreshTokenAsync(string token);
        Task RevokeRefreshTokenAsync(RefreshToken refreshToken, string? ipAddress = null, string? reason = null, string? replacedByToken = null);
        Task<bool> ValidateRefreshTokenAsync(string token);
        Task CleanupExpiredTokensAsync();
    }
}
