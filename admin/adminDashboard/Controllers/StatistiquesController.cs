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
                .Select(g => new {
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
                .Select(g => new {
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
            var result = stats.Select(s => new {
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
                .Select(g => new {
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
            var result = stats.Select(s => new {
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
                .Select(g => new {
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

        [HttpGet("montant-semaine")]
        public async Task<IActionResult> GetMontantSemaine()
        {
            // Calculer le début et la fin de la semaine en cours
            var aujourdhui = DateTime.Today;
            var debutSemaine = aujourdhui.AddDays(-(int)aujourdhui.DayOfWeek);
            var finSemaine = debutSemaine.AddDays(6);

            // Montant total des commandes de la semaine en cours
            var montantSemaine = await _context.Commandes
                .Where(c => c.DateCreation >= debutSemaine && c.DateCreation <= finSemaine)
                .SumAsync(c => c.MontantTotale);

            // Montant total des commandes de la semaine précédente
            var debutSemainePrecedente = debutSemaine.AddDays(-7);
            var finSemainePrecedente = debutSemaine.AddDays(-1);

            var montantSemainePrecedente = await _context.Commandes
                .Where(c => c.DateCreation >= debutSemainePrecedente && c.DateCreation <= finSemainePrecedente)
                .SumAsync(c => c.MontantTotale);

            // Calculer le pourcentage de changement
            double pourcentageChangement = 0;
            if (montantSemainePrecedente > 0)
            {
                pourcentageChangement = ((double)montantSemaine - (double)montantSemainePrecedente) / (double)montantSemainePrecedente * 100;
            }

            return Ok(new
            {
                MontantSemaine = montantSemaine,
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

        [HttpGet("commandes-livrees-par-jour")]
        public async Task<IActionResult> GetCommandesLivreesParJour(
            [FromQuery] DateTime? debut,
            [FromQuery] DateTime? fin,
            [FromQuery] string champDate = "dateCreation")
        {
            // Définir la période par défaut (mois en cours)
            var dateDebut = debut ?? new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
            var dateFin = fin ?? dateDebut.AddMonths(1).AddDays(-1);

            // Utiliser exactement le statut "livré" comme stocké dans la base
            var query = _context.Commandes.Where(c => c.Statut.ToLower() == "livré");

            // Filtrer par date selon le champ spécifié
            if (champDate.ToLower() == "datereception")
            {
                // Filtrer uniquement les commandes avec DateReception non null
                query = query.Where(c => c.DateReception.HasValue && 
                                        c.DateReception.Value >= dateDebut && 
                                        c.DateReception.Value <= dateFin);

                // Grouper par DateReception en gérant les valeurs nulles
                var commandesLivrees = await query
                    .GroupBy(c => c.DateReception.Value.Date)  // .Value est sûr car on a filtré les nulls
                    .Select(g => new {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Jour = g.Key.Day,
                        NombreCommandes = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                return Ok(commandesLivrees);
            }
            else
            {
                // Comportement par défaut (utiliser DateCreation)
                query = query.Where(c => c.DateCreation >= dateDebut && c.DateCreation <= dateFin);

                // Grouper par DateCreation
                var commandesLivrees = await query
                    .GroupBy(c => c.DateCreation.Date)
                    .Select(g => new {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Jour = g.Key.Day,
                        NombreCommandes = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                return Ok(commandesLivrees);
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
}using Microsoft.AspNetCore.Mvc;
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
                .Select(g => new {
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
                .Select(g => new {
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
            var result = stats.Select(s => new {
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
                .Select(g => new {
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
            var result = stats.Select(s => new {
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
                .Select(g => new {
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

        [HttpGet("montant-semaine")]
        public async Task<IActionResult> GetMontantSemaine()
        {
            // Calculer le début et la fin de la semaine en cours
            var aujourdhui = DateTime.Today;
            var debutSemaine = aujourdhui.AddDays(-(int)aujourdhui.DayOfWeek);
            var finSemaine = debutSemaine.AddDays(6);

            // Montant total des commandes de la semaine en cours
            var montantSemaine = await _context.Commandes
                .Where(c => c.DateCreation >= debutSemaine && c.DateCreation <= finSemaine)
                .SumAsync(c => c.MontantTotale);

            // Montant total des commandes de la semaine précédente
            var debutSemainePrecedente = debutSemaine.AddDays(-7);
            var finSemainePrecedente = debutSemaine.AddDays(-1);

            var montantSemainePrecedente = await _context.Commandes
                .Where(c => c.DateCreation >= debutSemainePrecedente && c.DateCreation <= finSemainePrecedente)
                .SumAsync(c => c.MontantTotale);

            // Calculer le pourcentage de changement
            double pourcentageChangement = 0;
            if (montantSemainePrecedente > 0)
            {
                pourcentageChangement = ((double)montantSemaine - (double)montantSemainePrecedente) / (double)montantSemainePrecedente * 100;
            }

            return Ok(new
            {
                MontantSemaine = montantSemaine,
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

        [HttpGet("commandes-livrees-par-jour")]
        public async Task<IActionResult> GetCommandesLivreesParJour(
            [FromQuery] DateTime? debut,
            [FromQuery] DateTime? fin,
            [FromQuery] string champDate = "dateCreation")
        {
            // Définir la période par défaut (mois en cours)
            var dateDebut = debut ?? new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
            var dateFin = fin ?? dateDebut.AddMonths(1).AddDays(-1);

            // Utiliser exactement le statut "livré" comme stocké dans la base
            var query = _context.Commandes.Where(c => c.Statut.ToLower() == "livré");

            // Filtrer par date selon le champ spécifié
            if (champDate.ToLower() == "datereception")
            {
                // Filtrer uniquement les commandes avec DateReception non null
                query = query.Where(c => c.DateReception.HasValue && 
                                        c.DateReception.Value >= dateDebut && 
                                        c.DateReception.Value <= dateFin);

                // Grouper par DateReception en gérant les valeurs nulles
                var commandesLivrees = await query
                    .GroupBy(c => c.DateReception.Value.Date)  // .Value est sûr car on a filtré les nulls
                    .Select(g => new {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Jour = g.Key.Day,
                        NombreCommandes = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                return Ok(commandesLivrees);
            }
            else
            {
                // Comportement par défaut (utiliser DateCreation)
                query = query.Where(c => c.DateCreation >= dateDebut && c.DateCreation <= dateFin);

                // Grouper par DateCreation
                var commandesLivrees = await query
                    .GroupBy(c => c.DateCreation.Date)
                    .Select(g => new {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Jour = g.Key.Day,
                        NombreCommandes = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                return Ok(commandesLivrees);
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
}using Microsoft.AspNetCore.Mvc;
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
                .Select(g => new {
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
                .Select(g => new {
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
            var result = stats.Select(s => new {
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
                .Select(g => new {
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
            var result = stats.Select(s => new {
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
                .Select(g => new {
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

        [HttpGet("montant-semaine")]
        public async Task<IActionResult> GetMontantSemaine()
        {
            // Calculer le début et la fin de la semaine en cours
            var aujourdhui = DateTime.Today;
            var debutSemaine = aujourdhui.AddDays(-(int)aujourdhui.DayOfWeek);
            var finSemaine = debutSemaine.AddDays(6);

            // Montant total des commandes de la semaine en cours
            var montantSemaine = await _context.Commandes
                .Where(c => c.DateCreation >= debutSemaine && c.DateCreation <= finSemaine)
                .SumAsync(c => c.MontantTotale);

            // Montant total des commandes de la semaine précédente
            var debutSemainePrecedente = debutSemaine.AddDays(-7);
            var finSemainePrecedente = debutSemaine.AddDays(-1);

            var montantSemainePrecedente = await _context.Commandes
                .Where(c => c.DateCreation >= debutSemainePrecedente && c.DateCreation <= finSemainePrecedente)
                .SumAsync(c => c.MontantTotale);

            // Calculer le pourcentage de changement
            double pourcentageChangement = 0;
            if (montantSemainePrecedente > 0)
            {
                pourcentageChangement = ((double)montantSemaine - (double)montantSemainePrecedente) / (double)montantSemainePrecedente * 100;
            }

            return Ok(new
            {
                MontantSemaine = montantSemaine,
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

        [HttpGet("commandes-livrees-par-jour")]
        public async Task<IActionResult> GetCommandesLivreesParJour(
            [FromQuery] DateTime? debut,
            [FromQuery] DateTime? fin,
            [FromQuery] string champDate = "dateCreation")
        {
            // Définir la période par défaut (mois en cours)
            var dateDebut = debut ?? new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
            var dateFin = fin ?? dateDebut.AddMonths(1).AddDays(-1);

            // Utiliser exactement le statut "livré" comme stocké dans la base
            var query = _context.Commandes.Where(c => c.Statut.ToLower() == "livré");

            // Filtrer par date selon le champ spécifié
            if (champDate.ToLower() == "datereception")
            {
                // Filtrer uniquement les commandes avec DateReception non null
                query = query.Where(c => c.DateReception.HasValue && 
                                        c.DateReception.Value >= dateDebut && 
                                        c.DateReception.Value <= dateFin);

                // Grouper par DateReception en gérant les valeurs nulles
                var commandesLivrees = await query
                    .GroupBy(c => c.DateReception.Value.Date)  // .Value est sûr car on a filtré les nulls
                    .Select(g => new {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Jour = g.Key.Day,
                        NombreCommandes = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                return Ok(commandesLivrees);
            }
            else
            {
                // Comportement par défaut (utiliser DateCreation)
                query = query.Where(c => c.DateCreation >= dateDebut && c.DateCreation <= dateFin);

                // Grouper par DateCreation
                var commandesLivrees = await query
                    .GroupBy(c => c.DateCreation.Date)
                    .Select(g => new {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Jour = g.Key.Day,
                        NombreCommandes = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                return Ok(commandesLivrees);
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
}using Microsoft.AspNetCore.Mvc;
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
                .Select(g => new {
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
                .Select(g => new {
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
            var result = stats.Select(s => new {
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
                .Select(g => new {
                    UtilisateurId = g.Key,
                    NombreTotalCommandes = g
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
            var result = stats.Select(s => new {
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
                .Select(g => new {
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
            var result = stats.Select(s => new {
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
                .Select(g => new {
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
                .CountAsync(c => c.Statut.ToLower() == "annulée" || c.Statut.ToLower() == "ann
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

        [HttpGet("montant-semaine")]
        public async Task<IActionResult> GetMontantSemaine()
        {
            // Calculer le début et la fin de la semaine en cours
            var aujourdhui = DateTime.Today;
            var debutSemaine = aujourdhui.AddDays(-(int)aujourdhui.DayOfWeek);
            var finSemaine = debutSemaine.AddDays(6);

            // Montant total des commandes de la semaine en cours
            var montantSemaine = await _context.Commandes
                .Where(c => c.DateCreation >= debutSemaine && c.DateCreation <= finSemaine)
                .SumAsync(c => c.MontantTotale);

            // Montant total des commandes de la semaine précédente
            var debutSemainePrecedente = debutSemaine.AddDays(-7);
            var finSemainePrecedente = debutSemaine.AddDays(-1);

            var montantSemainePrecedente = await _context.Commandes
                .Where(c => c.DateCreation >= debutSemainePrecedente && c.DateCreation <= finSemainePrecedente)
                .SumAsync(c => c.MontantTotale);

            // Calculer le pourcentage de changement
            double pourcentageChangement = 0;
            if (montantSemainePrecedente > 0)
            {
                pourcentageChangement = ((double)montantSemaine - (double)montantSemainePrecedente) / (double)montantSemainePrecedente * 100;
            }

            return Ok(new
            {
                MontantSemaine = montantSemaine,
                PourcentageChangement = Math.Round(pourcentageChangement, 2)
            });
        }
    }
}using Microsoft.AspNetCore.Mvc;
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

            return Ok(stats
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

        [HttpGet("montant-semaine")]
        public async Task<IActionResult> GetMontantSemaine()
        {
            // Calculer le début et la fin de la semaine en cours
            var aujourdhui = DateTime.Today;
            var debutSemaine = aujourdhui.AddDays(-(int)aujourdhui.DayOfWeek);
            var finSemaine = debutSemaine.AddDays(6);

            // Montant total des commandes de la semaine en cours
            var montantSemaine = await _context.Commandes
                .Where(c => c.DateCreation >= debutSemaine && c.DateCreation <= finSemaine)
                .SumAsync(c => c.MontantTotale);

            // Montant total des commandes de la semaine précédente
            var debutSemainePrecedente = debutSemaine.AddDays(-7);
            var finSemainePrecedente = debutSemaine.AddDays(-1);

            var montantSemainePrecedente = await _context.Commandes
                .Where(c => c.DateCreation >= debutSemainePrecedente && c.DateCreation <= finSemainePrecedente)
                .SumAsync(c => c.MontantTotale);

            // Calculer le pourcentage de changement
            double pourcentageChangement = 0;
            if (montantSemainePrecedente > 0)
            {
                pourcentageChangement = ((double)montantSemaine - (double)montantSemainePrecedente) / (double)montantSemainePrecedente * 100;
            }

            return Ok(new
            {
                MontantSemaine = montantSemaine,
                PourcentageChangement = Math.Round(pourcentageChangement, 2)
            });
        }
    }
}using Microsoft.AspNetCore.Mvc;
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
                .Select(g => new {
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
                .Select(g => new {
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
            var result = stats.Select(s => new {
                FournisseurId = s.FournisseurId,
                NomFournisseur = fournisseurs.FirstOrDefault(f => f.Id == s.FournisseurId)?.Nom ?? "Inconnu",
                NombreTotalCommandes = s.NombreTotalCommandes,
                MontantTotal = s.MontantTotal
            }).OrderByDescending(s => s.NombreTotalCommandes);

            return Ok(result);
        }
                PourcentageChangement

                PourcentageChangement
                PourcentageChangement
                PourcentageChangement
                PourcentageChangement
                PourcentageChangement
                PourcentageChangement
                PourcentageChangement
                PourcentageChangement
                PourcentageChangement
                PourcentageChangement
                PourcentageChangement
                PourcentageChangement
                PourcentageChangement
                PourcentageChangement
                PourcentageChangement






