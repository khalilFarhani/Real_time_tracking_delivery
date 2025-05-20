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


        [HttpGet("locations")]
        public async Task<IActionResult> GetCommandeLocations()
        {
            try
            {
                var locations = await _context.Commandes
                    .GroupBy(c => new { c.Latitude, c.Longitude, c.NomClient, c.AdressClient })
                    .Select(g => new
                    {
                        Id = g.Min(c => c.Id),
                        Name = g.Key.NomClient,
                        Address = g.Key.AdressClient,
                        Latitude = g.Key.Latitude,
                        Longitude = g.Key.Longitude,
                        CommandeCount = g.Count()
                    })
                    .ToListAsync();

                return Ok(locations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Erreur lors de la récupération des emplacements");
            }
        }

        [HttpGet("profits")]
        public async Task<IActionResult> GetProfits([FromQuery] string periode = "semaine")
        {
            try
            {
                List<object> donneesPeriode = new List<object>();
                decimal profitTotal = 0;
                decimal profitPeriodePrecedente = 0;

                // Déterminer la période
                switch (periode.ToLower())
                {
                    case "semaine":
                        // Jour actuel
                        var jourActuel = DateTime.UtcNow.Date;

                        // Jour précédent
                        var jourPrecedent = jourActuel.AddDays(-1);

                        // Profit du jour actuel
                        profitTotal = await _context.Commandes
                            .Where(c => c.DateReception.HasValue &&
                                    c.DateReception.Value.Date == jourActuel &&
                                    c.Statut.ToLower() == "livré")
                            .SumAsync(c => c.MontantTotale);

                        // Profit du jour précédent
                        profitPeriodePrecedente = await _context.Commandes
                            .Where(c => c.DateReception.HasValue &&
                                    c.DateReception.Value.Date == jourPrecedent &&
                                    c.Statut.ToLower() == "livré")
                            .SumAsync(c => c.MontantTotale);

                        // Les 7 derniers jours (aujourd'hui et les 6 jours précédents)
                        for (int i = 6; i >= 0; i--)
                        {
                            var jour = jourActuel.AddDays(-i);

                            var profit = await _context.Commandes
                                .Where(c => c.DateReception.HasValue &&
                                        c.DateReception.Value.Date == jour.Date &&
                                        c.Statut.ToLower() == "livré")
                                .SumAsync(c => c.MontantTotale);

                            donneesPeriode.Add(new
                            {
                                jour = jour.ToString("ddd"),
                                date = jour.ToString("yyyy-MM-dd"),
                                profit = profit
                            });
                        }
                        break;

                    case "mois":
                        // Mois actuel
                        var moisActuel = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
                        var finMoisActuel = moisActuel.AddMonths(1).AddDays(-1);

                        // Mois précédent
                        var moisPrecedent = moisActuel.AddMonths(-1);
                        var finMoisPrecedent = moisActuel.AddDays(-1);

                        // Profit du mois actuel
                        profitTotal = await _context.Commandes
                            .Where(c => c.DateReception.HasValue &&
                                    c.DateReception.Value >= moisActuel &&
                                    c.DateReception.Value <= finMoisActuel &&
                                    c.Statut.ToLower() == "livré")
                            .SumAsync(c => c.MontantTotale);

                        // Profit du mois précédent
                        profitPeriodePrecedente = await _context.Commandes
                            .Where(c => c.DateReception.HasValue &&
                                    c.DateReception.Value >= moisPrecedent &&
                                    c.DateReception.Value <= finMoisPrecedent &&
                                    c.Statut.ToLower() == "livré")
                            .SumAsync(c => c.MontantTotale);

                        // Année en cours pour les données mensuelles
                        int anneeEnCours = DateTime.UtcNow.Year;

                        // Récupérer les profits par mois pour l'année en cours
                        for (int mois = 1; mois <= 12; mois++)
                        {
                            var debutMois = new DateTime(anneeEnCours, mois, 1);
                            var finMois = debutMois.AddMonths(1).AddDays(-1);

                            var profit = await _context.Commandes
                                .Where(c => c.DateReception.HasValue &&
                                        c.DateReception.Value >= debutMois &&
                                        c.DateReception.Value <= finMois &&
                                        c.Statut.ToLower() == "livré")
                                .SumAsync(c => c.MontantTotale);

                            donneesPeriode.Add(new
                            {
                                mois = debutMois.ToString("MMM"),
                                date = debutMois.ToString("yyyy-MM"),
                                profit = mois <= DateTime.UtcNow.Month ? profit : 0
                            });
                        }
                        break;

                    case "annee":
                        // Année actuelle et précédente
                        int anneeActuelle = DateTime.UtcNow.Year;
                        int anneePrecedente = anneeActuelle - 1;

                        var debutAnneeActuelle = new DateTime(anneeActuelle, 1, 1);
                        var finAnneeActuelle = new DateTime(anneeActuelle, 12, 31);

                        var debutAnneePrecedente = new DateTime(anneePrecedente, 1, 1);
                        var finAnneePrecedente = new DateTime(anneePrecedente, 12, 31);

                        // Profit de l'année actuelle
                        profitTotal = await _context.Commandes
                            .Where(c => c.DateReception.HasValue &&
                                    c.DateReception.Value >= debutAnneeActuelle &&
                                    c.DateReception.Value <= finAnneeActuelle &&
                                    c.Statut.ToLower() == "livré")
                            .SumAsync(c => c.MontantTotale);

                        // Profit de l'année précédente
                        profitPeriodePrecedente = await _context.Commandes
                            .Where(c => c.DateReception.HasValue &&
                                    c.DateReception.Value >= debutAnneePrecedente &&
                                    c.DateReception.Value <= finAnneePrecedente &&
                                    c.Statut.ToLower() == "livré")
                            .SumAsync(c => c.MontantTotale);

                        // Récupérer les profits par année pour les 10 dernières années
                        int anneeFinale = DateTime.UtcNow.Year;
                        int anneeInitiale = anneeFinale - 9;

                        for (int annee = anneeInitiale; annee <= anneeFinale; annee++)
                        {
                            var debutAnnee = new DateTime(annee, 1, 1);
                            var finAnnee = new DateTime(annee, 12, 31);

                            var profit = await _context.Commandes
                                .Where(c => c.DateReception.HasValue &&
                                        c.DateReception.Value >= debutAnnee &&
                                        c.DateReception.Value <= finAnnee &&
                                        c.Statut.ToLower() == "livré")
                                .SumAsync(c => c.MontantTotale);

                            donneesPeriode.Add(new
                            {
                                annee = annee.ToString(),
                                date = annee.ToString(),
                                profit = profit
                            });
                        }
                        break;

                    default:
                        return BadRequest("Période non valide. Utilisez 'semaine', 'mois' ou 'annee'.");
                }

                // Calculer le pourcentage de changement (simplement pour déterminer si c'est en hausse, en baisse ou stable)
                double pourcentageChangement = 0;
                if (profitPeriodePrecedente > 0)
                {
                    pourcentageChangement = (double)((profitTotal - profitPeriodePrecedente) / profitPeriodePrecedente) * 100;
                }
                else if (profitTotal > 0 && profitPeriodePrecedente == 0)
                {
                    // Si la période précédente était à 0 mais qu'on a des profits maintenant, c'est une hausse
                    pourcentageChangement = 1; // Valeur positive pour indiquer une hausse
                }
                else if (profitTotal < profitPeriodePrecedente)
                {
                    // Si le profit actuel est inférieur au précédent, c'est une baisse
                    pourcentageChangement = -1; // Valeur négative pour indiquer une baisse
                }
                // Si les deux sont à 0 ou égaux, pourcentageChangement reste à 0 (stable)

                return Ok(new
                {
                    profitTotal,
                    pourcentageChangement = Math.Round(pourcentageChangement, 2),
                    donneesPeriode,
                    periode = periode.ToLower()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération des profits: {ex.Message}");
            }
        }

        [HttpGet("temps-traitement")]
        public async Task<IActionResult> GetTempsTraitement()
        {
            try
            {
                // Obtenir le premier jour du mois actuel
                var premierJourMois = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
                // Obtenir le premier jour du mois suivant
                var premierJourMoisSuivant = premierJourMois.AddMonths(1);

                // Récupérer uniquement les commandes livrées du mois actuel
                var commandes = await _context.Commandes
                    .Where(c => c.DateCreation >= premierJourMois &&
                           c.DateCreation < premierJourMoisSuivant &&
                           c.DateReception.HasValue &&
                           c.Statut.ToLower() == "livré") // Filtrer uniquement les commandes livrées
                    .OrderBy(c => c.DateCreation)
                    .Select(c => new
                    {
                        CommandeId = c.Id,
                        UtilisateurId = c.UtilisateurId,
                        TempsTraitement = c.DateReception.HasValue
                            ? (c.DateReception.Value - c.DateCreation).TotalHours
                            : 0
                    })
                    .ToListAsync();

                // Limiter à 15 commandes maximum pour la lisibilité du graphique
                var commandesLimitees = commandes.Take(15).ToList();

                // Récupérer tous les utilisateurs livreurs concernés en une seule requête
                var utilisateurIds = commandesLimitees.Select(c => c.UtilisateurId).Distinct().ToList();
                var livreurs = await _context.Utilisateurs
                    .Where(u => utilisateurIds.Contains(u.Id) && u.EstLivreur)
                    .Select(u => new { u.Id, u.Nom })
                    .ToDictionaryAsync(u => u.Id, u => u.Nom);

                // Construire le résultat final
                var result = commandesLimitees.Select(c => new
                {
                    c.CommandeId,
                    c.TempsTraitement,
                    NomLivreur = livreurs.TryGetValue(c.UtilisateurId, out var nom) ? nom : "Non assigné"
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur interne: {ex.Message}");
            }
        }
        [HttpGet("livreurs-en-transit")]
        public async Task<IActionResult> GetLivreursEnTransit()
        {
            try
            {
                // Récupérer les livreurs qui ont des commandes en transit
                var livreursEnTransit = await _context.Utilisateurs
                    .Where(u => u.EstLivreur && _context.Commandes.Any(c => c.UtilisateurId == u.Id && c.Statut.ToLower() == "en transit"))
                    .Select(u => new
                    {
                        LivreurId = u.Id,
                        Nom = u.Nom,
                        ImagePath = u.ImagePath,
                        Commandes = _context.Commandes
                            .Where(c => c.UtilisateurId == u.Id && c.Statut.ToLower() == "en transit")
                            .Select(c => new
                            {
                                CommandeId = c.Id,
                                CodeSuivi = c.CodeSuivi,
                                NomClient = c.NomClient,
                                AdresseClient = c.AdressClient,
                                Latitude = c.Latitude,
                                Longitude = c.Longitude
                            })
                            .ToList(),
                        NombreCommandes = _context.Commandes.Count(c => c.UtilisateurId == u.Id && c.Statut.ToLower() == "en transit"),
                        NombreCommandesLivrees = _context.Commandes.Count(c => c.UtilisateurId == u.Id && c.Statut.ToLower() == "livré"),
                        // Prendre les coordonnées de la première commande en transit (toutes les commandes d'un livreur auront les mêmes coordonnées)
                        Latitude = _context.Commandes
                            .Where(c => c.UtilisateurId == u.Id && c.Statut.ToLower() == "en transit")
                            .Select(c => c.Latitude)
                            .FirstOrDefault(),
                        Longitude = _context.Commandes
                            .Where(c => c.UtilisateurId == u.Id && c.Statut.ToLower() == "en transit")
                            .Select(c => c.Longitude)
                            .FirstOrDefault()
                    })
                    .ToListAsync();

                return Ok(livreursEnTransit);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération des livreurs en transit: {ex.Message}");
            }
        }
    }
}
