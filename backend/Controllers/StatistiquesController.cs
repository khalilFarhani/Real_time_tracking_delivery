using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AxiaLivraisonAPI.Data;


namespace AxiaLivraisonAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatistiquesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StatistiquesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("commandes-par-statut")]
        public async Task<IActionResult> GetCommandesParStatut()
        {
            // Sans filtre de date pour correspondre au total
            var stats = await _context.Commandes
                .GroupBy(c => c.Statut.ToLower()) // Normaliser la casse
                .Select(g => new { Statut = g.Key, Nombre = g.Count() })
                .ToListAsync();

            return Ok(stats);
        }

        [HttpGet("commandes-par-statut-semaine")]
        public async Task<IActionResult> GetCommandesParStatutSemaine()
        {
            var aujourdhui = DateTime.Today;
            var debutSemaine = aujourdhui.AddDays(-(int)aujourdhui.DayOfWeek);

            var stats = await _context.Commandes
                .Where(c => c.DateCreation >= debutSemaine)
                .GroupBy(c => c.Statut.ToLower()) // Normaliser la casse
                .Select(g => new { Statut = g.Key, Nombre = g.Count() })
                .ToListAsync();

            return Ok(stats);
        }

        [HttpGet("total-commandes")]
        public async Task<IActionResult> GetTotalCommandes()
        {
            var total = await _context.Commandes.CountAsync();

            // Liste des statuts considérés comme "en cours"
            var statutsEnCours = new[] {
                "en préparation", "en preparation",
                "en transit", "en cours",
                "en attente", "confirmée", "confirmee"
            };

            var enCours = await _context.Commandes
                .CountAsync(c => statutsEnCours.Contains(c.Statut.ToLower()));

            // Détail des statuts en cours
            var detailStatuts = await _context.Commandes
                .Where(c => statutsEnCours.Contains(c.Statut.ToLower()))
                .GroupBy(c => c.Statut.ToLower())
                .Select(g => new { Statut = g.Key, Nombre = g.Count() })
                .ToListAsync();

            // Calculer le pourcentage de changement par rapport à la semaine dernière
            var aujourdhui = DateTime.Today;
            var debutSemaine = aujourdhui.AddDays(-(int)aujourdhui.DayOfWeek);
            var debutSemaineDerniere = debutSemaine.AddDays(-7);

            var commandesCetteSemaine = await _context.Commandes
                .CountAsync(c => c.DateCreation >= debutSemaine);

            var commandesSemaineDerniere = await _context.Commandes
                .CountAsync(c => c.DateCreation >= debutSemaineDerniere && c.DateCreation < debutSemaine);

            double pourcentageChangement = 0;
            if (commandesSemaineDerniere > 0)
            {
                pourcentageChangement = ((double)commandesCetteSemaine - commandesSemaineDerniere) / commandesSemaineDerniere * 100;
            }

            return Ok(new
            {
                Total = total,
                EnCours = enCours,
                DetailStatuts = detailStatuts,
                PourcentageChangement = Math.Round(pourcentageChangement, 2)
            });
        }

        [HttpGet("montant-total")]
        public async Task<IActionResult> GetMontantTotal()
        {
            // Montant total de toutes les commandes
            var montantTotal = await _context.Commandes.SumAsync(c => c.MontantTotale);

            // Montant total des commandes du mois en cours
            var debutMois = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
            var finMois = debutMois.AddMonths(1).AddDays(-1);

            var montantMois = await _context.Commandes
                .Where(c => c.DateCreation >= debutMois && c.DateCreation <= finMois)
                .SumAsync(c => c.MontantTotale);

            // Montant total des commandes du mois précédent
            var debutMoisPrecedent = debutMois.AddMonths(-1);
            var finMoisPrecedent = debutMois.AddDays(-1);

            var montantMoisPrecedent = await _context.Commandes
                .Where(c => c.DateCreation >= debutMoisPrecedent && c.DateCreation <= finMoisPrecedent)
                .SumAsync(c => c.MontantTotale);

            // Calculer le pourcentage de changement
            double pourcentageChangement = 0;
            if (montantMoisPrecedent > 0)
            {
                pourcentageChangement = ((double)montantMois - (double)montantMoisPrecedent) / (double)montantMoisPrecedent * 100;
            }

            return Ok(new
            {
                MontantTotal = montantTotal,
                MontantMois = montantMois,
                PourcentageChangement = Math.Round(pourcentageChangement, 2)
            });
        }

        [HttpGet("commandes-par-jour")]
        public async Task<IActionResult> GetCommandesParJour()
        {
            var aujourdhui = DateTime.Today;
            var debutSemaine = aujourdhui.AddDays(-(int)aujourdhui.DayOfWeek);

            var commandesParJour = await _context.Commandes
                .Where(c => c.DateCreation >= debutSemaine)
                .GroupBy(c => c.DateCreation.Date)
                .Select(g => new
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Jour = g.Key.DayOfWeek.ToString(),
                    Nombre = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            return Ok(commandesParJour);
        }

        [HttpGet("commandes-par-fournisseur")]
        public async Task<IActionResult> GetCommandesParFournisseur([FromQuery] string periode = "all")
        {
            // Définir la plage de dates en fonction de la période
            DateTime? dateDebut = null;

            if (periode == "week")
            {
                var aujourdhui = DateTime.Today;
                dateDebut = aujourdhui.AddDays(-(int)aujourdhui.DayOfWeek);
            }
            else if (periode == "month")
            {
                dateDebut = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
            }

            // Requête de base
            var query = _context.Commandes.AsQueryable();

            // Appliquer le filtre de date si nécessaire
            if (dateDebut.HasValue)
            {
                query = query.Where(c => c.DateCreation >= dateDebut.Value);
            }

            // Exécuter la requête avec le filtre appliqué
            var stats = await query
                .GroupBy(c => c.FournisseurId)
                .Select(g => new
                {
                    FournisseurId = g.Key,
                    NombreTotalCommandes = g.Count(),
                    MontantTotal = g.Sum(c => c.MontantTotale)
                })
                .ToListAsync();

            // Récupérer les noms des fournisseurs
            var fournisseurIds = stats.Select(s => s.FournisseurId).ToList();
            var fournisseurs = await _context.Fournisseurs
                .Where(f => fournisseurIds.Contains(f.Id))
                .Select(f => new { f.Id, f.Nom })
                .ToListAsync();

            // Joindre les données
            var result = stats.Select(s => new
            {
                FournisseurId = s.FournisseurId,
                NomFournisseur = fournisseurs.FirstOrDefault(f => f.Id == s.FournisseurId)?.Nom ?? "Inconnu",
                NombreTotalCommandes = s.NombreTotalCommandes,
                MontantTotal = s.MontantTotal
            }).OrderByDescending(s => s.NombreTotalCommandes);

            return Ok(result);
        }

        [HttpGet("commandes-par-utilisateur")]
        public async Task<IActionResult> GetCommandesParUtilisateur()
        {
            var stats = await _context.Commandes
                .GroupBy(c => c.UtilisateurId)
                .Select(g => new
                {
                    UtilisateurId = g.Key,
                    NombreTotalCommandes = g.Count(),
                    MontantTotal = g.Sum(c => c.MontantTotale)
                })
                .ToListAsync();

            // Récupérer les noms des utilisateurs
            var utilisateurIds = stats.Select(s => s.UtilisateurId).ToList();
            var utilisateurs = await _context.Utilisateurs
                .Where(u => utilisateurIds.Contains(u.Id))
                .Select(u => new { u.Id, u.Nom })
                .ToListAsync();

            // Joindre les données
            var result = stats.Select(s => new
            {
                UtilisateurId = s.UtilisateurId,
                NomUtilisateur = utilisateurs.FirstOrDefault(u => u.Id == s.UtilisateurId)?.Nom ?? "Inconnu",
                NombreTotalCommandes = s.NombreTotalCommandes,
                MontantTotal = s.MontantTotal
            }).OrderByDescending(s => s.NombreTotalCommandes);

            return Ok(result);
        }

        [HttpGet("performance-mensuelle")]
        public async Task<IActionResult> GetPerformanceMensuelle()
        {
            // Obtenir les 12 derniers mois
            var aujourdhui = DateTime.Today;
            var mois = new List<DateTime>();

            for (int i = 11; i >= 0; i--)
            {
                mois.Add(new DateTime(aujourdhui.Year, aujourdhui.Month, 1).AddMonths(-i));
            }

            var result = new List<object>();

            foreach (var debutMois in mois)
            {
                var finMois = debutMois.AddMonths(1).AddDays(-1);

                var nombreCommandes = await _context.Commandes
                    .CountAsync(c => c.DateCreation >= debutMois && c.DateCreation <= finMois);

                var montantTotal = await _context.Commandes
                    .Where(c => c.DateCreation >= debutMois && c.DateCreation <= finMois)
                    .SumAsync(c => c.MontantTotale);

                result.Add(new
                {
                    Mois = debutMois.ToString("MMM yyyy"),
                    NombreCommandes = nombreCommandes,
                    MontantTotal = montantTotal
                });
            }

            return Ok(result);
        }

        [HttpGet("top-clients")]
        public async Task<IActionResult> GetTopClients()
        {
            // Regrouper par email client pour identifier les clients uniques
            var topClients = await _context.Commandes
                .GroupBy(c => c.EmailClient)
                .Select(g => new
                {
                    EmailClient = g.Key,
                    NomClient = g.First().NomClient,
                    NombreCommandes = g.Count(),
                    MontantTotal = g.Sum(c => c.MontantTotale)
                })
                .OrderByDescending(c => c.MontantTotal)
                .Take(10)
                .ToListAsync();

            return Ok(topClients);
        }

        [HttpGet("taux-conversion")]
        public async Task<IActionResult> GetTauxConversion()
        {
            // Nombre total de commandes
            var totalCommandes = await _context.Commandes.CountAsync();

            // Nombre de commandes livrées
            var commandesLivrees = await _context.Commandes
                .CountAsync(c => c.Statut.ToLower() == "livrée" || c.Statut.ToLower() == "livree");

            // Nombre de commandes annulées
            var commandesAnnulees = await _context.Commandes
                .CountAsync(c => c.Statut.ToLower() == "annulée" || c.Statut.ToLower() == "annulee");

            // Calculer les taux
            double tauxLivraison = totalCommandes > 0 ? (double)commandesLivrees / totalCommandes * 100 : 0;
            double tauxAnnulation = totalCommandes > 0 ? (double)commandesAnnulees / totalCommandes * 100 : 0;

            return Ok(new
            {
                TotalCommandes = totalCommandes,
                CommandesLivrees = commandesLivrees,
                CommandesAnnulees = commandesAnnulees,
                TauxLivraison = Math.Round(tauxLivraison, 2),
                TauxAnnulation = Math.Round(tauxAnnulation, 2)
            });
        }

        [HttpGet("commandes-fournisseurs-mensuels")]
        public async Task<IActionResult> GetCommandesFournisseursMensuels()
        {
            // Obtenir les 6 derniers mois
            var aujourdhui = DateTime.Today;
            var mois = new List<DateTime>();

            for (int i = 5; i >= 0; i--)
            {
                mois.Add(new DateTime(aujourdhui.Year, aujourdhui.Month, 1).AddMonths(-i));
            }

            var result = new List<object>();

            // Préparer les données pour chaque mois
            foreach (var debutMois in mois)
            {
                var finMois = debutMois.AddMonths(1).AddDays(-1);

                // Commandes pour ce mois
                var commandesMois = await _context.Commandes
                    .CountAsync(c => c.DateCreation >= debutMois && c.DateCreation <= finMois);

                // Fournisseurs pour ce mois
                var fournisseursMois = await _context.Fournisseurs
                    .CountAsync(f => f.DateCreation >= debutMois && f.DateCreation <= finMois);

                result.Add(new
                {
                    Mois = debutMois.ToString("MMM"),
                    NombreCommandes = commandesMois,
                    NombreFournisseurs = fournisseursMois
                });
            }

            // Calculer les totaux
            var totalCommandes = await _context.Commandes.CountAsync();
            var totalFournisseurs = await _context.Fournisseurs.CountAsync();

            // Calculer les pourcentages de changement pour les commandes et fournisseurs
            var moisActuel = new DateTime(aujourdhui.Year, aujourdhui.Month, 1);
            var moisPrecedent = moisActuel.AddMonths(-1);
            var moisPrecedentPrecedent = moisPrecedent.AddMonths(-1);

            // Calcul pour les commandes
            var commandesMoisActuel = await _context.Commandes
                .CountAsync(c => c.DateCreation >= moisActuel && c.DateCreation < moisActuel.AddMonths(1));

            var commandesMoisPrecedent = await _context.Commandes
                .CountAsync(c => c.DateCreation >= moisPrecedent && c.DateCreation < moisActuel);

            double pourcentageChangementCommandes = commandesMoisPrecedent > 0
                ? ((double)commandesMoisActuel - commandesMoisPrecedent) / commandesMoisPrecedent * 100
                : 0;

            // Calcul pour les fournisseurs
            var fournisseursMoisActuel = await _context.Fournisseurs
                .CountAsync(f => f.DateCreation >= moisActuel && f.DateCreation < moisActuel.AddMonths(1));

            var fournisseursMoisPrecedent = await _context.Fournisseurs
                .CountAsync(f => f.DateCreation >= moisPrecedent && f.DateCreation < moisActuel);

            double pourcentageChangementFournisseurs = fournisseursMoisPrecedent > 0
                ? ((double)fournisseursMoisActuel - fournisseursMoisPrecedent) / fournisseursMoisPrecedent * 100
                : 0;

            return Ok(new
            {
                DonneesMensuelles = result,
                TotalCommandes = totalCommandes,
                TotalFournisseurs = totalFournisseurs,
                PourcentageChangementCommandes = Math.Round(pourcentageChangementCommandes, 2),
                PourcentageChangementFournisseurs = Math.Round(pourcentageChangementFournisseurs, 2)
            });
        }

        [HttpGet("livreurs-actifs")]
        public async Task<IActionResult> GetLivreursActifs()
        {
            // Récupérer les commandes en transit
            var commandesEnTransit = await _context.Commandes
                .Where(c => c.Statut.ToLower() == "en transit")
                .ToListAsync();

            // Récupérer les utilisateurs qui sont des livreurs
            var livreurs = await _context.Utilisateurs
                .Where(u => u.EstLivreur)
                .ToListAsync();

            // Compter les livreurs qui ont des commandes en transit
            // Nous supposons que le livreur est l'utilisateur associé à la commande
            var livreursActifsIds = commandesEnTransit
                .Select(c => c.UtilisateurId)
                .Distinct()
                .ToList();

            // Filtrer pour ne garder que les utilisateurs qui sont des livreurs
            var livreursActifs = livreurs
                .Where(l => livreursActifsIds.Contains(l.Id))
                .Select(l => new { l.Id, l.Nom })
                .ToList();

            return Ok(livreursActifs);
        }

        [HttpGet("revenus-mois")]
        public async Task<IActionResult> GetRevenusMois()
        {
            // Calculer le début et la fin du mois en cours
            var aujourdhui = DateTime.Today;
            var debutMois = new DateTime(aujourdhui.Year, aujourdhui.Month, 1);
            var finMois = debutMois.AddMonths(1).AddDays(-1);

            // Revenus du mois en cours (commandes livrées uniquement)
            var revenusMois = await _context.Commandes
                .Where(c => c.DateReception.HasValue &&
                           c.DateReception.Value >= debutMois &&
                           c.DateReception.Value <= finMois &&
                           c.Statut.ToLower() == "livré")
                .SumAsync(c => c.MontantTotale);

            // Revenus du mois précédent
            var debutMoisPrecedent = debutMois.AddMonths(-1);
            var finMoisPrecedent = debutMois.AddDays(-1);

            var revenusMoisPrecedent = await _context.Commandes
                .Where(c => c.DateReception.HasValue &&
                           c.DateReception.Value >= debutMoisPrecedent &&
                           c.DateReception.Value <= finMoisPrecedent &&
                           c.Statut.ToLower() == "livré")
                .SumAsync(c => c.MontantTotale);

            // Calculer le pourcentage de changement
            double pourcentageChangement = 0;
            if (revenusMoisPrecedent > 0)
            {
                pourcentageChangement = ((double)revenusMois - (double)revenusMoisPrecedent) / (double)revenusMoisPrecedent * 100;
            }

            return Ok(new
            {
                RevenusMois = revenusMois,
                PourcentageChangement = Math.Round(pourcentageChangement, 2)
            });
        }

        [HttpGet("commandes-aujourdhui")]
        public async Task<IActionResult> GetCommandesAujourdhui()
        {
            // Date d'aujourd'hui
            var aujourdhui = DateTime.Today;
            var demain = aujourdhui.AddDays(1);

            // Nombre de commandes créées aujourd'hui
            var nombreCommandesAujourdhui = await _context.Commandes
                .CountAsync(c => c.DateCreation >= aujourdhui && c.DateCreation < demain);

            // Nombre de commandes créées hier
            var hier = aujourdhui.AddDays(-1);
            var nombreCommandesHier = await _context.Commandes
                .CountAsync(c => c.DateCreation >= hier && c.DateCreation < aujourdhui);

            // Calculer le pourcentage de changement
            double pourcentageChangement = 0;
            if (nombreCommandesHier > 0)
            {
                pourcentageChangement = ((double)nombreCommandesAujourdhui - nombreCommandesHier) / nombreCommandesHier * 100;
            }

            return Ok(new
            {
                NombreCommandes = nombreCommandesAujourdhui,
                PourcentageChangement = Math.Round(pourcentageChangement, 2)
            });
        }

        [HttpGet("top-livreur")]
        public async Task<IActionResult> GetTopLivreur()
        {
            // Statut considéré comme "livré"
            var statutLivre = "livré";

            // Récupérer tous les livreurs avec leurs statistiques
            var livreursStats = await _context.Utilisateurs
                .Where(u => u.EstLivreur)
                .Select(u => new
                {
                    UtilisateurId = u.Id,
                    Nom = u.Nom,
                    NombreCommandesTotal = _context.Commandes.Count(c => c.UtilisateurId == u.Id),
                    NombreCommandesLivrees = _context.Commandes.Count(c => c.UtilisateurId == u.Id && c.Statut.ToLower() == statutLivre)
                })
                .Where(l => l.NombreCommandesTotal > 0) // Exclure les livreurs sans commandes
                .ToListAsync();

            if (!livreursStats.Any())
            {
                return Ok(new { NomLivreur = "Aucun", NombreCommandesLivrees = 0, NombreCommandesTotal = 0, PourcentageLivraison = 0 });
            }

            // Calculer le pourcentage de livraison pour chaque livreur
            var livreursAvecPourcentage = livreursStats
                .Select(l => new
                {
                    l.UtilisateurId,
                    l.Nom,
                    l.NombreCommandesTotal,
                    l.NombreCommandesLivrees,
                    PourcentageLivraison = (double)l.NombreCommandesLivrees / l.NombreCommandesTotal * 100
                })
                .OrderByDescending(l => l.PourcentageLivraison)
                .ThenByDescending(l => l.NombreCommandesLivrees)
                .ToList();

            // Prendre le premier (meilleur pourcentage, puis plus grand nombre de livraisons)
            var topLivreur = livreursAvecPourcentage.FirstOrDefault();

            return Ok(new
            {
                LivreurId = topLivreur.UtilisateurId,
                NomLivreur = topLivreur.Nom,
                NombreCommandesLivrees = topLivreur.NombreCommandesLivrees,
                NombreCommandesTotal = topLivreur.NombreCommandesTotal,
                PourcentageLivraison = Math.Round(topLivreur.PourcentageLivraison, 2)
            });
        }

        [HttpGet("top-fournisseur")]
        public async Task<IActionResult> GetTopFournisseur()
        {
            // Récupérer tous les fournisseurs avec leurs statistiques
            var fournisseursStats = await _context.Commandes
                .GroupBy(c => c.FournisseurId)
                .Select(g => new
                {
                    FournisseurId = g.Key,
                    NombreCommandes = g.Count(),
                    MontantTotal = g.Sum(c => c.MontantTotale)
                })
                .OrderByDescending(f => f.NombreCommandes)
                .ThenByDescending(f => f.MontantTotal)
                .Take(1)
                .ToListAsync();

            if (!fournisseursStats.Any())
            {
                return Ok(new { NomFournisseur = "Aucun", NombreCommandes = 0, MontantTotal = 0 });
            }

            var topFournisseur = fournisseursStats.First();

            // Récupérer le nom du fournisseur
            var fournisseur = await _context.Fournisseurs
                .Where(f => f.Id == topFournisseur.FournisseurId)
                .Select(f => new { f.Nom })
                .FirstOrDefaultAsync();

            return Ok(new
            {
                FournisseurId = topFournisseur.FournisseurId,
                NomFournisseur = fournisseur?.Nom ?? "Inconnu",
                NombreCommandes = topFournisseur.NombreCommandes,
                MontantTotal = topFournisseur.MontantTotal
            });
        }

        [HttpGet("livreurs-disponibles")]
        public async Task<IActionResult> GetLivreursDisponibles()
        {
            try
            {
                // Récupérer tous les livreurs
                var livreurs = await _context.Utilisateurs
                    .Where(u => u.EstLivreur)
                    .ToListAsync();

                // Récupérer les livreurs qui ont des commandes en cours
                var livreursAvecCommandes = await _context.Commandes
                    .Where(c => c.Statut.ToLower() != "livré" && c.Statut.ToLower() != "annulé")
                    .Select(c => c.UtilisateurId)
                    .Distinct()
                    .ToListAsync();

                // Calculer le nombre de livreurs sans commandes (disponibles)
                var livreursDisponibles = livreurs
                    .Where(l => !livreursAvecCommandes.Contains(l.Id))
                    .Count();

                return Ok(new { nombreLivreursDisponibles = livreursDisponibles });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur interne: {ex.Message}");
            }
        }

        [HttpGet("livreurs-commandes-mois")]
        public async Task<IActionResult> GetLivreursCommandesMois()
        {
            try
            {
                // Définir la période du mois en cours
                var debutMois = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
                var finMois = debutMois.AddMonths(1).AddDays(-1);

                // Récupérer tous les livreurs
                var livreurs = await _context.Utilisateurs
                    .Where(u => u.EstLivreur)
                    .ToListAsync();

                // Statuts considérés
                var statutLivre = "livré";
                var statutEnTransit = "en transit";

                // Préparer les statistiques pour chaque livreur
                var livreursStats = new List<object>();

                foreach (var livreur in livreurs)
                {
                    // Compter les commandes par statut pour ce livreur pour le mois en cours
                    var nombreCommandesTotal = await _context.Commandes
                        .CountAsync(c => c.UtilisateurId == livreur.Id
                                     && c.DateCreation >= debutMois
                                     && c.DateCreation <= finMois);

                    var nombreCommandesLivrees = await _context.Commandes
                        .CountAsync(c => c.UtilisateurId == livreur.Id
                                     && c.Statut.ToLower() == statutLivre
                                     && c.DateCreation >= debutMois
                                     && c.DateCreation <= finMois);

                    var nombreCommandesEnTransit = await _context.Commandes
                        .CountAsync(c => c.UtilisateurId == livreur.Id
                                     && c.Statut.ToLower() == statutEnTransit
                                     && c.DateCreation >= debutMois
                                     && c.DateCreation <= finMois);

                    // N'ajouter que les livreurs ayant au moins une commande
                    if (nombreCommandesTotal > 0)
                    {
                        livreursStats.Add(new
                        {
                            livreurId = livreur.Id,
                            nomLivreur = livreur.Nom,
                            nombreCommandesTotal,
                            nombreCommandesLivrees,
                            nombreCommandesEnTransit
                        });
                    }
                }

                return Ok(livreursStats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération des statistiques des livreurs: {ex.Message}");
            }
        }
        [HttpGet("commandes-creees-par-jour")]
        public async Task<IActionResult> GetCommandesCreesParJour()
        {
            try
            {
                // Étape 1: Exécuter la partie groupable en base de données
                var donneesBrutes = await _context.Commandes
                    .GroupBy(c => c.DateCreation.Date)
                    .Select(g => new
                    {
                        Date = g.Key, // Garder comme DateTime pour le SQL
                        NombreCommandes = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync(); // Exécution en base de données

                // Étape 2: Formater les dates côté serveur
                var resultat = donneesBrutes.Select(x => new
                {
                    Date = x.Date.ToString("yyyy-MM-dd"),
                    Jour = x.Date.Day,
                    Mois = x.Date.Month,
                    Annee = x.Date.Year,
                    x.NombreCommandes
                }).ToList();

                return Ok(resultat);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Erreur lors du traitement des données");
            }
        }
    }
}
