using AxiaLivraisonAPI.Services;
using System.IdentityModel.Tokens.Jwt;

namespace AxiaLivraisonAPI.Middleware
{
    public class JwtBlacklistMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<JwtBlacklistMiddleware> _logger;

        public JwtBlacklistMiddleware(RequestDelegate next, ILogger<JwtBlacklistMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, IJwtService jwtService)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (!string.IsNullOrEmpty(token))
            {
                try
                {
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var jwtToken = tokenHandler.ReadJwtToken(token);
                    var tokenId = jwtToken.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Jti)?.Value;

                    if (!string.IsNullOrEmpty(tokenId))
                    {
                        var isBlacklisted = await jwtService.IsTokenBlacklistedAsync(tokenId);
                        if (isBlacklisted)
                        {
                            context.Response.StatusCode = 401;
                            await context.Response.WriteAsync("Token has been revoked");
                            return;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"Error checking token blacklist: {ex.Message}");
                }
            }

            await _next(context);
        }
    }
}
