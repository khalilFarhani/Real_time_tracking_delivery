using System.Threading.Tasks;

namespace AxiaLivraisonAPI.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(
            string recipientEmail,
            string recipientName,
            string subject,
            string body,
            int commandeId);
    }
}