// GET: api/notification
[HttpGet]
public async Task<ActionResult<IEnumerable<object>>> GetAllNotifications()
{
    try
    {
        var notifications = await _context.Notifications
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
        _logger.LogError(ex, "Error getting all notifications");
        return StatusCode(500, "Internal server error");
    }
}

// GET: api/notification/unread-count
[HttpGet("unread-count")]
public async Task<ActionResult<object>> GetTotalUnreadCount()
{
    var count = await _context.Notifications
        .CountAsync(n => !n.EstLue);

    return Ok(new { count });
}

// PUT: api/notification/mark-all-read
[HttpPut("mark-all-read")]
public async Task<IActionResult> MarkAllAsRead()
{
    await _context.Notifications
        .Where(n => !n.EstLue)
        .ForEachAsync(n => n.EstLue = true);

    await _context.SaveChangesAsync();

    return NoContent();
}