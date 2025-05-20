// DELETE: api/permissions/supprimer/{id}
[HttpDelete("supprimer/{id:int}")]
public async Task<IActionResult> DeletePermission(int id)
{
    var permission = await _context.Permissions.FindAsync(id);
    if (permission == null)
    {
        return NotFound(new { message = "Permission non trouvé." });
    }

    try
    {
        // First, find all user-permission associations for this permission
        var userPermissions = await _context.UtilisateurPermissions
            .Where(up => up.PermissionId == id)
            .ToListAsync();

        // Remove all these associations
        if (userPermissions.Any())
        {
            _context.UtilisateurPermissions.RemoveRange(userPermissions);
            await _context.SaveChangesAsync();
        }

        // Now it's safe to remove the permission itself
        _context.Permissions.Remove(permission);
        await _context.SaveChangesAsync();

        return NoContent();
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Erreur lors de la suppression de la permission", error = ex.Message });
    }
}