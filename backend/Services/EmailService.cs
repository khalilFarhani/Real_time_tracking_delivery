using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Logging;
using AxiaLivraisonAPI.Models;
using AxiaLivraisonAPI.Data;

namespace AxiaLivraisonAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly ApplicationDbContext _context;

        public EmailService(
            IConfiguration configuration,
            ILogger<EmailService> logger,
            ApplicationDbContext context)
        {
            _configuration = configuration;
            _logger = logger;
            _context = context;
        }

        public async Task SendEmailAsync(
            string recipientEmail,
            string recipientName,
            string subject,
            string body,
            int commandeId)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(
                    _configuration["EmailSettings:SenderName"],
                    _configuration["EmailSettings:SenderEmail"]));
                message.To.Add(new MailboxAddress(recipientName, recipientEmail));
                message.Subject = subject;

                message.Body = new TextPart("html") { Text = body };

                using var client = new SmtpClient();
                await client.ConnectAsync(
                    _configuration["EmailSettings:SmtpServer"],
                    int.Parse(_configuration["EmailSettings:Port"]),
                    MailKit.Security.SecureSocketOptions.StartTls);

                await client.AuthenticateAsync(
                    _configuration["EmailSettings:Username"],
                    _configuration["EmailSettings:Password"]);

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                var notification = new Notification
                {
                    Destinataire = recipientEmail,
                    Sujet = subject,
                    Contenu = body,
                    DateEnvoi = DateTime.UtcNow,
                    EstLue = false,
                    CommandeId = commandeId
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email");
                throw;
            }
        }
    }
}