// POST: api/authentification/connexion
[HttpPost("connexion")]
public async Task<IActionResult> Connexion(LoginDTO loginDTO)
{
    var utilisateur = await _context.Utilisateurs
        .FirstOrDefaultAsync(u => u.Identifiant == loginDTO.Identifiant);

    if (utilisateur == null)
    {
        return Unauthorized("Identifiant incorrect.");
    }

    if (utilisateur.MotDePasse != loginDTO.MotDePasse)
    {
        return Unauthorized("Mot de passe incorrect.");
    }
    
    var permissions = await _context.UtilisateurPermissions
        .Where(up => up.UtilisateurId == utilisateur.Id)
        .Include(up => up.Permission)
        .Select(up => new
        {
            up.Permission.PermissionName,
            up.Permission.Description
        })
        .ToListAsync();
        
    // Renvoyer plus d'informations sur l'utilisateur, y compris EstLivreur
    return Ok(new
    {
        Message = "Connexion réussie !",
        UserId = utilisateur.Id,
        Nom = utilisateur.Nom,
        Email = utilisateur.Email,
        ImagePath = utilisateur.ImagePath,
        EstAdmin = utilisateur.EstAdmin,
        EstLivreur = utilisateur.EstLivreur, // Add this line to include EstLivreur
        Permissions = permissions
    });
}
