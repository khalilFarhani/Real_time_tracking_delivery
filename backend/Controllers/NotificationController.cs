using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AxiaLivraisonAPI.Data;
using AxiaLivraisonAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace AxiaLivraisonAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(ApplicationDbContext context, ILogger<NotificationController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/notification/by-commande/{commandeId}
        [HttpGet("by-commande/{commandeId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetNotificationsByCommande(int commandeId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Where(n => n.CommandeId == commandeId)
                    .Include(n => n.Commande)
                    .OrderByDescending(n => n.DateEnvoi)
                    .Select(n => new
                    {
                        id = n.Id,
                        recipient = n.Destinataire,
                        subject = n.Sujet,
                        body = n.Contenu,
                        sentDate = n.DateEnvoi.ToString("o"),
                        isRead = n.EstLue,
                        commandeId = n.CommandeId,
                        codeSuivi = n.Commande.CodeSuivi
                    })
                    .ToListAsync();

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting notifications for commande {commandeId}");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/notification/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetNotification(int id)
        {
            var notification = await _context.Notifications
                .Include(n => n.Commande)
                .Where(n => n.Id == id)
                .Select(n => new
                {
                    id = n.Id,
                    recipient = n.Destinataire,
                    subject = n.Sujet,
                    body = n.Contenu,
                    sentDate = n.DateEnvoi.ToString("o"),
                    isRead = n.EstLue,
                    commandeId = n.CommandeId,
                    codeSuivi = n.Commande.CodeSuivi
                })
                .FirstOrDefaultAsync();

            if (notification == null)
            {
                return NotFound();
            }

            return Ok(notification);
        }

        // GET: api/notification/unread-count/by-commande/{commandeId}
        [HttpGet("unread-count/by-commande/{commandeId}")]
        public async Task<ActionResult<object>> GetUnreadCountByCommande(int commandeId)
        {
            var count = await _context.Notifications
                .CountAsync(n => n.CommandeId == commandeId && !n.EstLue);

            return Ok(new { count });
        }

        // PUT: api/notification/mark-read/{id}
        [HttpPut("mark-read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return NotFound();
            }

            notification.EstLue = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/notification/mark-all-read/by-commande/{commandeId}
        [HttpPut("mark-all-read/by-commande/{commandeId}")]
        public async Task<IActionResult> MarkAllAsReadForCommande(int commandeId)
        {
            await _context.Notifications
                .Where(n => n.CommandeId == commandeId && !n.EstLue)
                .ForEachAsync(n => n.EstLue = true);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/notification/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return NotFound();
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}