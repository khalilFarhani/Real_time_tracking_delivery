// DELETE: api/fournisseurs/supprimer-avec-commandes/{id}
[HttpDelete("supprimer-avec-commandes/{id:int}")]
public async Task<IActionResult> DeleteFournisseurWithCommandes(int id)
{
    var fournisseur = await _context.Fournisseurs.FindAsync(id);
    if (fournisseur == null)
    {
        return NotFound(new { message = "Fournisseur non trouvé." });
    }

    try
    {
        // Trouver toutes les commandes associées à ce fournisseur
        var commandes = await _context.Commandes
            .Where(c => c.FournisseurId == id)
            .ToListAsync();

        // Supprimer d'abord les notifications liées aux commandes
        foreach (var commande in commandes)
        {
            var notifications = await _context.Notifications
                .Where(n => n.CommandeId == commande.Id)
                .ToListAsync();

            if (notifications.Any())
            {
                _context.Notifications.RemoveRange(notifications);
            }
        }
        
        // Ensuite supprimer les commandes
        if (commandes.Any())
        {
            _context.Commandes.RemoveRange(commandes);
        }

        // Enfin, supprimer le fournisseur
        _context.Fournisseurs.Remove(fournisseur);
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = "Fournisseur et ses commandes supprimés avec succès",
            commandesCount = commandes.Count
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { 
            message = "Erreur lors de la suppression du fournisseur et de ses commandes", 
            details = ex.Message
        });
    }
}
