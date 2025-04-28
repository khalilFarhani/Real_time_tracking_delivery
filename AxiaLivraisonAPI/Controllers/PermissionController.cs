using AxiaLivraisonAPI.Data;
using AxiaLivraisonAPI.DTO;
using AxiaLivraisonAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace AxiaLivraisonAPI.Controllers
{
    [ApiController]
    [Route("api/permissions")]
    public class PermissionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PermissionController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/permission/liste
        [HttpGet("liste")]
        public async Task<ActionResult<IEnumerable<Permission>>> GetAllPermissions()
        {
            return await _context.Permissions.ToListAsync();
        }



        // GET: api/permissions/details/{id}
        [HttpGet("details/{id:int}")]
        public async Task<ActionResult<Permission>> GetPermissionById(int id)
        {
            var permission = await _context.Permissions.FindAsync(id);

            if (permission == null)
            {
                return NotFound(new { message = "Permission non trouvé." });
            }

            return permission;
        }



        // POST: api/permissions/ajouter
        [HttpPost("ajouter")]
        public async Task<IActionResult> CreatePermission([FromBody] PermissionDTO permissionDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var permission = new Permission
            {
                PermissionName = permissionDTO.PermissionName,
                Description = permissionDTO.Description,
            };

            _context.Permissions.Add(permission);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPermissionById), new { id = permission.Id }, permission);
        }

        // PUT: api/permissions/modifier/{id}
        [HttpPut("modifier/{id:int}")]
        public async Task<IActionResult> UpdatePermission(int id, [FromBody] PermissionDTO permissionDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var permission = await _context.Permissions.FindAsync(id);
            if (permission == null)
            {
                return NotFound(new { message = "Permission non trouvé." });
            }

            // Update the properties
            permission.PermissionName = permissionDTO.PermissionName;
            permission.Description = permissionDTO.Description;
            

            _context.Entry(permission).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PermissionExists(id))
                {
                    return NotFound(new { message = "Permission non trouvé." });
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/permissions/supprimer/{id}
        [HttpDelete("supprimer/{id:int}")]
        public async Task<IActionResult> DeletePermission(int id)
        {
            var permission = await _context.Permissions.FindAsync(id);
            if (permission == null)
            {
                return NotFound(new { message = "Permission non trouvé." });
            }

            _context.Permissions.Remove(permission);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PermissionExists(int id)
        {
            return _context.Permissions.Any(e => e.Id == id);
        }
        // Nouvel endpoint pour obtenir les permissions d'un utilisateur
        [HttpGet("utilisateur/{utilisateurId}")]
        public async Task<ActionResult<IEnumerable<Permission>>> GetPermissionsByUtilisateur(int utilisateurId)
        {
            var permissions = await _context.UtilisateurPermissions
                .Where(up => up.UtilisateurId == utilisateurId)
                .Select(up => up.Permission)
                .ToListAsync();

            return Ok(permissions);
        }

        [HttpPost("assigner")]
        public async Task<IActionResult> AssignerPermissions([FromBody] AssignerPermissionsDTO dto)
        {
            // Vérifier que l'utilisateur existe
            var utilisateur = await _context.Utilisateurs.FindAsync(dto.UtilisateurId);
            if (utilisateur == null)
            {
                return NotFound(new { message = "Utilisateur non trouvé." });
            }

            // Supprimer les permissions existantes pour cet utilisateur
            var existingPermissions = _context.UtilisateurPermissions
                .Where(up => up.UtilisateurId == dto.UtilisateurId);
            _context.UtilisateurPermissions.RemoveRange(existingPermissions);

            // Vérifier et ajouter les nouvelles permissions
            foreach (var permissionId in dto.PermissionIds)
            {
                var permission = await _context.Permissions.FindAsync(permissionId);
                if (permission == null)
                {
                    return BadRequest(new { message = $"Permission avec ID {permissionId} non trouvée." });
                }

                _context.UtilisateurPermissions.Add(new UtilisateurPermission
                {
                    UtilisateurId = dto.UtilisateurId,
                    PermissionId = permissionId
                });
            }

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la sauvegarde des permissions", error = ex.Message });
            }
        }
    }
}
