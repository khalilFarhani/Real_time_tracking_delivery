using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AxiaLivraisonAPI.Data;

namespace AxiaLivraisonAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RapportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RapportController(ApplicationDbContext context)
        {
            _context = context;
        }

        private (DateTime dateDebut, DateTime dateFin) GetDateRange(string periode)
        {
            DateTime dateDebut;
            DateTime dateFin;

            switch (periode.ToLower())
            {
                case "jour":
                    dateDebut = DateTime.Today;
                    dateFin = DateTime.Today.AddDays(1).AddTicks(-1); // Fin de la journée
                    break;
                case "semaine":
                    dateDebut = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek);
                    dateFin = DateTime.Now;
                    break;
                case "mois":
                    dateDebut = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
                    dateFin = DateTime.Now;
                    break;
                case "annee":
                    dateDebut = new DateTime(DateTime.Today.Year, 1, 1);
                    dateFin = DateTime.Now;
                    break;
                default:
                    throw new ArgumentException("Période non valide. Utilisez 'jour', 'semaine', 'mois' ou 'annee'.");
            }

            return (dateDebut, dateFin);
        }

        [HttpGet("livreurs")]
        public async Task<IActionResult> GetLivreurs()
        {
            try
            {
                var livreurs = await _context.Utilisateurs
                    .Where(u => u.EstLivreur)
                    .Select(u => new
                    {
                        Id = u.Id,
                        Nom = u.Nom,
                        Email = u.Email,
                        Telephone = u.Telephone,
                        ImagePath = u.ImagePath
                    })
                    .ToListAsync();

                return Ok(livreurs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération des livreurs: {ex.Message}");
            }
        }

        [HttpGet("livreurs-performance")]
        public async Task<IActionResult> GetLivreursPerformance([FromQuery] string periode = "mois")
        {
            try
            {
                var (dateDebut, dateFin) = GetDateRange(periode);

                // Récupérer les statistiques des livreurs
                var livreursPerformance = await _context.Utilisateurs
                    .Where(u => u.EstLivreur)
                    .Select(u => new
                    {
                        LivreurId = u.Id,
                        NomLivreur = u.Nom,
                        Email = u.Email,
                        Telephone = u.Telephone,
                        ImagePath = u.ImagePath,
                        // Commandes totales dans la période
                        CommandesTotales = _context.Commandes
                            .Count(c => c.UtilisateurId == u.Id && c.DateCreation >= dateDebut && c.DateCreation <= dateFin),
                        // Commandes livrées dans la période
                        CommandesLivrees = _context.Commandes
                            .Count(c => c.UtilisateurId == u.Id && c.DateCreation >= dateDebut && c.DateCreation <= dateFin
                                   && c.Statut.ToLower() == "livré"),
                        // Commandes en transit
                        CommandesEnTransit = _context.Commandes
                            .Count(c => c.UtilisateurId == u.Id && c.DateCreation >= dateDebut && c.DateCreation <= dateFin
                                   && c.Statut.ToLower() == "en transit"),
                        // Commandes annulées
                        CommandesAnnulees = _context.Commandes
                            .Count(c => c.UtilisateurId == u.Id && c.DateCreation >= dateDebut && c.DateCreation <= dateFin
                                   && c.Statut.ToLower() == "annulé"),
                        // Revenus générés
                        RevenusGeneres = _context.Commandes
                            .Where(c => c.UtilisateurId == u.Id && c.DateCreation >= dateDebut && c.DateCreation <= dateFin
                                   && c.Statut.ToLower() == "livré")
                            .Sum(c => (decimal?)c.MontantTotale) ?? 0
                    })
                    .Where(l => l.CommandesTotales > 0) // Exclure les livreurs sans commandes
                    .ToListAsync();

                // Calculer les pourcentages et métriques supplémentaires
                var result = livreursPerformance.Select(l => new
                {
                    l.LivreurId,
                    l.NomLivreur,
                    l.Email,
                    l.Telephone,
                    l.ImagePath,
                    l.CommandesTotales,
                    l.CommandesLivrees,
                    l.CommandesEnTransit,
                    l.CommandesAnnulees,
                    l.RevenusGeneres,
                    TauxLivraison = l.CommandesTotales > 0 ? Math.Round((double)l.CommandesLivrees / l.CommandesTotales * 100, 2) : 0,
                    TauxAnnulation = l.CommandesTotales > 0 ? Math.Round((double)l.CommandesAnnulees / l.CommandesTotales * 100, 2) : 0,
                    RevenuMoyen = l.CommandesLivrees > 0 ? Math.Round(l.RevenusGeneres / l.CommandesLivrees, 2) : 0
                }).OrderByDescending(l => l.TauxLivraison).ThenByDescending(l => l.CommandesLivrees);

                return Ok(new
                {
                    Periode = periode,
                    DateDebut = dateDebut.ToString("yyyy-MM-dd"),
                    DateFin = dateFin.ToString("yyyy-MM-dd"),
                    Livreurs = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération des performances des livreurs: {ex.Message}");
            }
        }

        [HttpGet("livreurs-statistiques-globales")]
        public async Task<IActionResult> GetLivreursStatistiquesGlobales([FromQuery] string periode = "mois", [FromQuery] int? livreurId = null)
        {
            try
            {
                var (dateDebut, dateFin) = GetDateRange(periode);

                if (livreurId.HasValue)
                {
                    // Statistiques pour un livreur spécifique
                    var livreur = await _context.Utilisateurs.FindAsync(livreurId.Value);
                    if (livreur == null || !livreur.EstLivreur)
                    {
                        return NotFound("Livreur non trouvé");
                    }

                    var totalCommandesPeriode = await _context.Commandes
                        .CountAsync(c => c.UtilisateurId == livreurId.Value && c.DateCreation >= dateDebut && c.DateCreation <= dateFin);

                    var commandesLivreesPeriode = await _context.Commandes
                        .CountAsync(c => c.UtilisateurId == livreurId.Value && c.DateCreation >= dateDebut && c.DateCreation <= dateFin
                                   && c.Statut.ToLower() == "livré");

                    var revenusTotalPeriode = await _context.Commandes
                        .Where(c => c.UtilisateurId == livreurId.Value && c.DateCreation >= dateDebut && c.DateCreation <= dateFin
                               && c.Statut.ToLower() == "livré")
                        .SumAsync(c => c.MontantTotale);

                    var tauxLivraisonGlobal = totalCommandesPeriode > 0
                        ? Math.Round((double)commandesLivreesPeriode / totalCommandesPeriode * 100, 2)
                        : 0;

                    return Ok(new
                    {
                        Periode = periode,
                        DateDebut = dateDebut.ToString("yyyy-MM-dd"),
                        DateFin = dateFin.ToString("yyyy-MM-dd"),
                        TotalLivreurs = 1, // Un seul livreur sélectionné
                        // Livreur actif si il a au moins une commande "en transit"
                        LivreursActifs = await _context.Commandes
                            .AnyAsync(c => c.UtilisateurId == livreurId.Value && c.Statut.ToLower() == "en transit") ? 1 : 0,
                        TotalCommandesPeriode = totalCommandesPeriode,
                        CommandesLivreesPeriode = commandesLivreesPeriode,
                        RevenusTotalPeriode = revenusTotalPeriode,
                        TauxLivraisonGlobal = tauxLivraisonGlobal,
                        RevenuMoyenParCommande = commandesLivreesPeriode > 0
                            ? Math.Round(revenusTotalPeriode / commandesLivreesPeriode, 2)
                            : 0
                    });
                }
                else
                {
                    // Statistiques globales pour tous les livreurs
                    var totalLivreurs = await _context.Utilisateurs.CountAsync(u => u.EstLivreur);

                    // Livreurs actifs = ceux qui ont au moins une commande "en transit"
                    var livreursActifs = await _context.Commandes
                        .Where(c => c.Statut.ToLower() == "en transit")
                        .Select(c => c.UtilisateurId)
                        .Distinct()
                        .CountAsync(id => _context.Utilisateurs.Any(u => u.Id == id && u.EstLivreur));

                    var totalCommandesPeriode = await _context.Commandes
                        .CountAsync(c => c.DateCreation >= dateDebut && c.DateCreation <= dateFin);

                    var commandesLivreesPeriode = await _context.Commandes
                        .CountAsync(c => c.DateCreation >= dateDebut && c.DateCreation <= dateFin
                                   && c.Statut.ToLower() == "livré");

                    var revenusTotalPeriode = await _context.Commandes
                        .Where(c => c.DateCreation >= dateDebut && c.DateCreation <= dateFin
                               && c.Statut.ToLower() == "livré")
                        .SumAsync(c => c.MontantTotale);

                    var tauxLivraisonGlobal = totalCommandesPeriode > 0
                        ? Math.Round((double)commandesLivreesPeriode / totalCommandesPeriode * 100, 2)
                        : 0;

                    return Ok(new
                    {
                        Periode = periode,
                        DateDebut = dateDebut.ToString("yyyy-MM-dd"),
                        DateFin = dateFin.ToString("yyyy-MM-dd"),
                        TotalLivreurs = totalLivreurs,
                        LivreursActifs = livreursActifs,
                        TotalCommandesPeriode = totalCommandesPeriode,
                        CommandesLivreesPeriode = commandesLivreesPeriode,
                        RevenusTotalPeriode = revenusTotalPeriode,
                        TauxLivraisonGlobal = tauxLivraisonGlobal,
                        RevenuMoyenParCommande = commandesLivreesPeriode > 0
                            ? Math.Round(revenusTotalPeriode / commandesLivreesPeriode, 2)
                            : 0
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération des statistiques globales: {ex.Message}");
            }
        }

        [HttpGet("livreurs-evolution-temporelle")]
        public async Task<IActionResult> GetLivreursEvolutionTemporelle([FromQuery] string periode = "mois")
        {
            try
            {
                List<object> evolution = new List<object>();

                switch (periode.ToLower())
                {
                    case "semaine":
                        // Les 7 derniers jours
                        for (int i = 6; i >= 0; i--)
                        {
                            var jour = DateTime.Today.AddDays(-i);
                            var jourSuivant = jour.AddDays(1);

                            var stats = await GetStatsJour(jour, jourSuivant);
                            evolution.Add(new
                            {
                                Periode = jour.ToString("ddd dd/MM"),
                                Date = jour.ToString("yyyy-MM-dd"),
                                stats.CommandesTotales,
                                stats.CommandesLivrees,
                                stats.Revenus,
                                stats.LivreursActifs
                            });
                        }
                        break;

                    case "mois":
                        // Les 12 derniers mois
                        for (int i = 11; i >= 0; i--)
                        {
                            var mois = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1).AddMonths(-i);
                            var moisSuivant = mois.AddMonths(1);

                            var stats = await GetStatsJour(mois, moisSuivant);
                            evolution.Add(new
                            {
                                Periode = mois.ToString("MMM yyyy"),
                                Date = mois.ToString("yyyy-MM"),
                                stats.CommandesTotales,
                                stats.CommandesLivrees,
                                stats.Revenus,
                                stats.LivreursActifs
                            });
                        }
                        break;

                    case "annee":
                        // Les 5 dernières années
                        for (int i = 4; i >= 0; i--)
                        {
                            var annee = DateTime.Today.Year - i;
                            var debutAnnee = new DateTime(annee, 1, 1);
                            var finAnnee = new DateTime(annee + 1, 1, 1);

                            var stats = await GetStatsJour(debutAnnee, finAnnee);
                            evolution.Add(new
                            {
                                Periode = annee.ToString(),
                                Date = annee.ToString(),
                                stats.CommandesTotales,
                                stats.CommandesLivrees,
                                stats.Revenus,
                                stats.LivreursActifs
                            });
                        }
                        break;

                    default:
                        return BadRequest("Période non valide. Utilisez 'semaine', 'mois' ou 'annee'.");
                }

                return Ok(new
                {
                    Periode = periode,
                    Evolution = evolution
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération de l'évolution temporelle: {ex.Message}");
            }
        }

        private async Task<(int CommandesTotales, int CommandesLivrees, decimal Revenus, int LivreursActifs)> GetStatsJour(DateTime debut, DateTime fin)
        {
            var commandesTotales = await _context.Commandes
                .CountAsync(c => c.DateCreation >= debut && c.DateCreation < fin);

            var commandesLivrees = await _context.Commandes
                .CountAsync(c => c.DateCreation >= debut && c.DateCreation < fin
                           && c.Statut.ToLower() == "livré");

            var revenus = await _context.Commandes
                .Where(c => c.DateCreation >= debut && c.DateCreation < fin
                       && c.Statut.ToLower() == "livré")
                .SumAsync(c => c.MontantTotale);

            // Livreurs actifs = ceux qui ont au moins une commande "en transit" (sans filtre de date)
            var livreursActifs = await _context.Commandes
                .Where(c => c.Statut.ToLower() == "en transit")
                .Select(c => c.UtilisateurId)
                .Distinct()
                .CountAsync(id => _context.Utilisateurs.Any(u => u.Id == id && u.EstLivreur));

            return (commandesTotales, commandesLivrees, revenus, livreursActifs);
        }

        [HttpGet("top-livreurs")]
        public async Task<IActionResult> GetTopLivreurs([FromQuery] string periode = "mois", [FromQuery] int limit = 10)
        {
            try
            {
                var (dateDebut, dateFin) = GetDateRange(periode);

                var topLivreurs = await _context.Utilisateurs
                    .Where(u => u.EstLivreur)
                    .Select(u => new
                    {
                        LivreurId = u.Id,
                        NomLivreur = u.Nom,
                        ImagePath = u.ImagePath,
                        CommandesLivrees = _context.Commandes
                            .Count(c => c.UtilisateurId == u.Id && c.DateCreation >= dateDebut && c.DateCreation <= dateFin
                                   && c.Statut.ToLower() == "livré"),
                        CommandesTotales = _context.Commandes
                            .Count(c => c.UtilisateurId == u.Id && c.DateCreation >= dateDebut && c.DateCreation <= dateFin),
                        RevenusGeneres = _context.Commandes
                            .Where(c => c.UtilisateurId == u.Id && c.DateCreation >= dateDebut && c.DateCreation <= dateFin
                                   && c.Statut.ToLower() == "livré")
                            .Sum(c => (decimal?)c.MontantTotale) ?? 0
                    })
                    .Where(l => l.CommandesTotales > 0)
                    .ToListAsync();

                var result = topLivreurs
                    .Select(l => new
                    {
                        l.LivreurId,
                        l.NomLivreur,
                        l.ImagePath,
                        l.CommandesLivrees,
                        l.CommandesTotales,
                        l.RevenusGeneres,
                        TauxLivraison = l.CommandesTotales > 0 ? Math.Round((double)l.CommandesLivrees / l.CommandesTotales * 100, 2) : 0,
                        Score = l.CommandesLivrees * 0.6 + (l.CommandesTotales > 0 ? (double)l.CommandesLivrees / l.CommandesTotales * 100 * 0.4 : 0)
                    })
                    .OrderByDescending(l => l.Score)
                    .Take(limit);

                return Ok(new
                {
                    Periode = periode,
                    TopLivreurs = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération du top des livreurs: {ex.Message}");
            }
        }

        [HttpGet("livreurs-temps-moyen")]
        public async Task<IActionResult> GetLivreursTempsTraitementMoyen([FromQuery] string periode = "mois")
        {
            try
            {
                var (dateDebut, dateFin) = GetDateRange(periode);

                var livreursTemps = await _context.Utilisateurs
                    .Where(u => u.EstLivreur)
                    .Select(u => new
                    {
                        LivreurId = u.Id,
                        NomLivreur = u.Nom,
                        CommandesLivrees = _context.Commandes
                            .Where(c => c.UtilisateurId == u.Id && c.DateCreation >= dateDebut && c.DateCreation <= dateFin
                                   && c.Statut.ToLower() == "livré" && c.DateReception.HasValue)
                            .ToList(),
                    })
                    .ToListAsync();

                var result = livreursTemps
                    .Where(l => l.CommandesLivrees.Any())
                    .Select(l => new
                    {
                        l.LivreurId,
                        l.NomLivreur,
                        NombreCommandesLivrees = l.CommandesLivrees.Count,
                        TempsMoyenHeures = l.CommandesLivrees.Any()
                            ? Math.Round(l.CommandesLivrees.Average(c => (c.DateReception!.Value - c.DateCreation).TotalHours), 2)
                            : 0,
                        TempsMinHeures = l.CommandesLivrees.Any()
                            ? Math.Round(l.CommandesLivrees.Min(c => (c.DateReception!.Value - c.DateCreation).TotalHours), 2)
                            : 0,
                        TempsMaxHeures = l.CommandesLivrees.Any()
                            ? Math.Round(l.CommandesLivrees.Max(c => (c.DateReception!.Value - c.DateCreation).TotalHours), 2)
                            : 0
                    })
                    .OrderBy(l => l.TempsMoyenHeures);

                return Ok(new
                {
                    Periode = periode,
                    LivreursTempsTraitement = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération des temps de traitement: {ex.Message}");
            }
        }

        [HttpGet("livreurs-repartition-statuts")]
        public async Task<IActionResult> GetLivreursRepartitionStatuts([FromQuery] string periode = "mois")
        {
            try
            {
                var (dateDebut, dateFin) = GetDateRange(periode);

                var repartitionStatuts = await _context.Commandes
                    .Where(c => c.DateCreation >= dateDebut && c.DateCreation <= dateFin)
                    .Join(_context.Utilisateurs.Where(u => u.EstLivreur),
                          c => c.UtilisateurId,
                          u => u.Id,
                          (c, u) => new { c.Statut, u.Nom })
                    .GroupBy(x => x.Statut.ToLower())
                    .Select(g => new
                    {
                        Statut = g.Key,
                        Nombre = g.Count(),
                        Pourcentage = 0.0 // Sera calculé côté serveur
                    })
                    .ToListAsync();

                var total = repartitionStatuts.Sum(r => r.Nombre);
                var result = repartitionStatuts.Select(r => new
                {
                    r.Statut,
                    r.Nombre,
                    Pourcentage = total > 0 ? Math.Round((double)r.Nombre / total * 100, 2) : 0
                });

                return Ok(new
                {
                    Periode = periode,
                    RepartitionStatuts = result,
                    Total = total
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération de la répartition des statuts: {ex.Message}");
            }
        }

        // Endpoint unifié pour toutes les données du rapport
        [HttpGet("donnees-completes")]
        public async Task<IActionResult> GetDonneesCompletes([FromQuery] string periode = "mois")
        {
            try
            {
                // Récupérer toutes les données en parallèle
                var statistiquesGlobalesTask = GetLivreursStatistiquesGlobales(periode);
                var performanceLivreursTask = GetLivreursPerformance(periode);
                var evolutionTemporelleTask = GetLivreursEvolutionTemporelle(periode);
                var topLivreursTask = GetTopLivreurs(periode);
                var tempsTraitementTask = GetLivreursTempsTraitementMoyen(periode);
                var repartitionStatutsTask = GetLivreursRepartitionStatuts(periode);

                await Task.WhenAll(
                    statistiquesGlobalesTask,
                    performanceLivreursTask,
                    evolutionTemporelleTask,
                    topLivreursTask,
                    tempsTraitementTask,
                    repartitionStatutsTask
                );

                // Extraire les données des résultats
                var statistiquesGlobales = ExtractDataFromActionResult(await statistiquesGlobalesTask);
                var performanceLivreurs = ExtractDataFromActionResult(await performanceLivreursTask);
                var evolutionTemporelle = ExtractDataFromActionResult(await evolutionTemporelleTask);
                var topLivreurs = ExtractDataFromActionResult(await topLivreursTask);
                var tempsTraitement = ExtractDataFromActionResult(await tempsTraitementTask);
                var repartitionStatuts = ExtractDataFromActionResult(await repartitionStatutsTask);

                return Ok(new
                {
                    statistiquesGlobales,
                    performanceLivreurs,
                    evolutionTemporelle,
                    topLivreurs,
                    tempsTraitement,
                    repartitionStatuts
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération des données complètes: {ex.Message}");
            }
        }

        private object ExtractDataFromActionResult(IActionResult actionResult)
        {
            if (actionResult is OkObjectResult okResult)
            {
                return okResult.Value;
            }
            return null;
        }

        // ==================== ENDPOINTS POUR RAPPORTS INDIVIDUELS ====================

        // GET: api/rapport/livreur-dashboard/{livreurId}
        [HttpGet("livreur-dashboard/{livreurId:int}")]
        public async Task<ActionResult> GetLivreurDashboard(int livreurId, [FromQuery] string periode = "mois")
        {
            var (dateDebut, dateFin) = GetDateRange(periode);

            // Vérifier que le livreur existe
            var livreur = await _context.Utilisateurs
                .Where(u => u.Id == livreurId && u.EstLivreur)
                .FirstOrDefaultAsync();

            if (livreur == null)
            {
                return NotFound(new { message = "Livreur non trouvé." });
            }

            // Statistiques principales du livreur
            var commandesTotales = await _context.Commandes
                .Where(c => c.UtilisateurId == livreurId && c.DateCreation >= dateDebut && c.DateCreation <= dateFin)
                .CountAsync();

            var commandesLivrees = await _context.Commandes
                .Where(c => c.UtilisateurId == livreurId && c.DateCreation >= dateDebut && c.DateCreation <= dateFin && c.Statut == "Livré")
                .CountAsync();

            var commandesEnCours = await _context.Commandes
                .Where(c => c.UtilisateurId == livreurId && c.DateCreation >= dateDebut && c.DateCreation <= dateFin &&
                       (c.Statut == "En transit" || c.Statut == "En préparation"))
                .CountAsync();

            var revenus = await _context.Commandes
                .Where(c => c.UtilisateurId == livreurId && c.DateCreation >= dateDebut && c.DateCreation <= dateFin && c.Statut == "Livré")
                .SumAsync(c => c.MontantTotale);

            var tauxLivraison = commandesTotales > 0 ? (double)commandesLivrees / commandesTotales * 100 : 0;

            // Calcul des temps de livraison
            var commandesAvecTemps = await _context.Commandes
                .Where(c => c.UtilisateurId == livreurId && c.DateCreation >= dateDebut && c.DateCreation <= dateFin
                       && c.Statut == "Livré" && c.DateReception.HasValue)
                .Select(c => new
                {
                    TempsLivraisonHeures = (c.DateReception!.Value - c.DateCreation).TotalHours
                })
                .ToListAsync();

            var tempsMoyenLivraison = commandesAvecTemps.Any() ? Math.Round(commandesAvecTemps.Average(c => c.TempsLivraisonHeures), 2) : 0;
            var tempsMinLivraison = commandesAvecTemps.Any() ? Math.Round(commandesAvecTemps.Min(c => c.TempsLivraisonHeures), 2) : 0;
            var tempsMaxLivraison = commandesAvecTemps.Any() ? Math.Round(commandesAvecTemps.Max(c => c.TempsLivraisonHeures), 2) : 0;

            // Répartition des statuts
            var repartitionStatuts = await _context.Commandes
                .Where(c => c.UtilisateurId == livreurId && c.DateCreation >= dateDebut && c.DateCreation <= dateFin)
                .GroupBy(c => c.Statut)
                .Select(g => new
                {
                    Statut = g.Key,
                    Nombre = g.Count(),
                    Pourcentage = commandesTotales > 0 ? Math.Round((double)g.Count() / commandesTotales * 100, 2) : 0
                })
                .ToListAsync();

            // Zones de livraison les plus fréquentes (basé sur les adresses)
            var commandesLivreesData = await _context.Commandes
                .Where(c => c.UtilisateurId == livreurId && c.DateCreation >= dateDebut && c.DateCreation <= dateFin && c.Statut == "Livré")
                .Select(c => new
                {
                    AdressClient = c.AdressClient,
                    MontantTotale = c.MontantTotale
                })
                .ToListAsync();

            var zonesLivraison = commandesLivreesData
                .GroupBy(c => c.AdressClient.Length > 20 ? c.AdressClient.Substring(0, 20) : c.AdressClient)
                .Select(g => new
                {
                    Zone = g.Key,
                    NombreLivraisons = g.Count(),
                    RevenusZone = g.Sum(c => c.MontantTotale)
                })
                .OrderByDescending(z => z.NombreLivraisons)
                .Take(5)
                .ToList();

            // Revenus par jour pour le graphique
            var revenusParJourData = await _context.Commandes
                .Where(c => c.UtilisateurId == livreurId && c.DateCreation >= dateDebut && c.DateCreation <= dateFin && c.Statut == "Livré")
                .GroupBy(c => c.DateCreation.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Revenus = g.Sum(c => c.MontantTotale),
                    NombreCommandes = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            var revenusParJour = revenusParJourData.Select(x => new
            {
                Date = x.Date.ToString("yyyy-MM-dd"),
                Revenus = x.Revenus,
                NombreCommandes = x.NombreCommandes
            }).ToList();

            // Commandes récentes (filtrées par période sélectionnée)
            var commandesRecentes = await _context.Commandes
                .Where(c => c.UtilisateurId == livreurId && c.DateCreation >= dateDebut && c.DateCreation <= dateFin)
                .OrderByDescending(c => c.DateCreation)
                .Take(5)
                .Select(c => new
                {
                    Id = c.Id,
                    DateCreation = c.DateCreation,
                    MontantTotale = c.MontantTotale,
                    Statut = c.Statut,
                    AdresseLivraison = c.AdressClient
                })
                .ToListAsync();

            var result = new
            {
                LivreurInfo = new
                {
                    Id = livreur.Id,
                    Nom = livreur.Nom,
                    Email = livreur.Email,
                    Telephone = livreur.Telephone,
                    ImagePath = livreur.ImagePath
                },
                StatistiquesPrincipales = new
                {
                    CommandesTotales = commandesTotales,
                    CommandesLivrees = commandesLivrees,
                    CommandesEnCours = commandesEnCours,
                    Revenus = revenus,
                    TauxLivraison = Math.Round(tauxLivraison, 2),
                    RevenuMoyen = commandesLivrees > 0 ? Math.Round(revenus / commandesLivrees, 2) : 0
                },
                TempsLivraison = new
                {
                    TempsMoyenHeures = tempsMoyenLivraison,
                    TempsMinHeures = tempsMinLivraison,
                    TempsMaxHeures = tempsMaxLivraison,
                    NombreCommandesAvecTemps = commandesAvecTemps.Count
                },
                RepartitionStatuts = repartitionStatuts,
                ZonesLivraison = zonesLivraison,
                RevenusParJour = revenusParJour,
                CommandesRecentes = commandesRecentes,
                Periode = periode
            };

            return Ok(result);
        }

        // ENDPOINT TEMPORAIRE POUR CRÉER DES DONNÉES DE TEST
        [HttpPost("create-test-data/{livreurId:int}")]
        public async Task<ActionResult> CreateTestData(int livreurId)
        {
            try
            {
                // Vérifier que le livreur existe
                var livreur = await _context.Utilisateurs
                    .Where(u => u.Id == livreurId && u.EstLivreur)
                    .FirstOrDefaultAsync();

                if (livreur == null)
                {
                    return NotFound(new { message = "Livreur non trouvé." });
                }

                var random = new Random();
                var commandesTest = new List<object>();

                // Créer des commandes pour différentes périodes de cette année
                var periodesTest = new[]
                {
                    new { Mois = 1, Nombre = 3 },  // Janvier
                    new { Mois = 3, Nombre = 2 },  // Mars
                    new { Mois = 6, Nombre = 4 },  // Juin
                    new { Mois = 9, Nombre = 2 },  // Septembre
                    new { Mois = DateTime.Today.Month, Nombre = 5 }  // Mois actuel
                };

                foreach (var periode in periodesTest)
                {
                    for (int i = 0; i < periode.Nombre; i++)
                    {
                        var dateCommande = new DateTime(DateTime.Today.Year, periode.Mois, random.Next(1, 28))
                            .AddHours(random.Next(8, 20))
                            .AddMinutes(random.Next(0, 59));

                        var statuts = new[] { "Livré", "En transit", "En préparation", "Confirmé" };
                        var statut = statuts[random.Next(statuts.Length)];

                        var commande = new
                        {
                            UtilisateurId = livreurId,
                            DateCreation = dateCommande,
                            MontantTotale = Math.Round((decimal)(random.NextDouble() * 100 + 20), 2),
                            Statut = statut,
                            AdressClient = $"Adresse test {random.Next(1, 100)}, Ville Test",
                            NomClient = $"Client Test {random.Next(1, 100)}",
                            TelephoneClient = $"0{random.Next(10000000, 99999999)}",
                            EmailClient = $"test{random.Next(1, 100)}@example.com",
                            Description = $"Commande de test {i + 1} pour {periode.Mois}/{DateTime.Today.Year}",
                            PrixUnitaire = Math.Round((decimal)(random.NextDouble() * 50 + 10), 2),
                            Quantite = random.Next(1, 5),
                            MontantHorsTax = 0,
                            Tva = 0,
                            DateReception = statut == "Livré" ? dateCommande.AddHours(random.Next(2, 48)) : (DateTime?)null,
                            CodeSuivi = $"TEST{DateTime.Today.Year}{periode.Mois:D2}{i + 1:D3}",
                            FournisseurId = 1 // Assumant qu'il y a au moins un fournisseur avec ID 1
                        };

                        commandesTest.Add(commande);
                    }
                }

                return Ok(new
                {
                    message = $"Données de test créées pour le livreur {livreur.Nom}",
                    commandesCreees = commandesTest.Count,
                    commandes = commandesTest,
                    note = "⚠️ ATTENTION: Ceci est un endpoint de test. Utilisez un vrai système de création de commandes en production."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la création des données de test: {ex.Message}");
            }
        }
    }
}
