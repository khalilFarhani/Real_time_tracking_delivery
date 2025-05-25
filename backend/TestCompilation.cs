using AxiaLivraisonAPI.Models;
using AxiaLivraisonAPI.Services;
using AxiaLivraisonAPI.DTO;
using AxiaLivraisonAPI.Data;

namespace AxiaLivraisonAPI.Test
{
    // This is a simple test class to verify that all JWT-related types can be resolved
    public class TestCompilation
    {
        public void TestJwtTypes()
        {
            // Test that all JWT-related types can be instantiated or referenced
            
            // Models
            var user = new Utilisateur();
            var refreshToken = new RefreshToken();
            var blacklistedToken = new BlacklistedToken();
            
            // DTOs
            var authResponse = new AuthResponseDTO();
            var refreshTokenDto = new RefreshTokenDTO();
            var registerClientDto = new RegisterClientDTO();
            
            // This method should compile without errors if all types are properly defined
            Console.WriteLine("JWT Authentication types compilation test passed!");
        }
    }
}
