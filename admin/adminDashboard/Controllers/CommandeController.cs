[HttpDelete("supprimer/{id:int}")]
public async Task<IActionResult> DeleteCommande(int id)
{
    var commande = await _context.Commandes.FindAsync(id);
    if (commande == null)
    {
        return NotFound(new { message = "Commande non trouvée." });
    }

    try
    {
        // First, find and delete all notifications related to this commande
        var notifications = await _context.Notifications
            .Where(n => n.CommandeId == id)
            .ToListAsync();

        if (notifications.Any())
        {
            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();
        }

        // Now it's safe to delete the commande
        _context.Commandes.Remove(commande);
        await _context.SaveChangesAsync();

        return NoContent();
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Erreur lors de la suppression de la commande {CommandeId}", id);
        
        return StatusCode(500, new { 
            message = "Erreur lors de la suppression de la commande", 
            error = ex.Message,
            details = "Cette commande ne peut pas être supprimée car elle est référencée par d'autres éléments du système."
        });
    }
}