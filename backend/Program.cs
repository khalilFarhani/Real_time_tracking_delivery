// Importer les bibliothèques nécessaires pour l'application
using AxiaLivraisonAPI.Data; // Pour accéder à la base de données
using AxiaLivraisonAPI.Services; // Pour les services de l'application
using Microsoft.AspNetCore.Builder; // Pour construire l'application web
using Microsoft.AspNetCore.Hosting; // Pour héberger l'application
using Microsoft.EntityFrameworkCore; // Pour travailler avec la base de données
using Microsoft.Extensions.Configuration; // Pour lire les configurations
using Microsoft.Extensions.DependencyInjection; // Pour gérer les dépendances
using Microsoft.Extensions.FileProviders; // Pour servir des fichiers statiques
using Microsoft.Extensions.Hosting; // Pour gérer l'environnement d'hébergement
using System.IO; // Pour travailler avec les fichiers et dossiers
using Microsoft.AspNetCore.Authentication.JwtBearer; // Pour l'authentification JWT
using Microsoft.IdentityModel.Tokens; // Pour la sécurité des tokens
using System.Text; // Pour encoder/décoder du texte
using AxiaLivraisonAPI.Middleware; // Pour les middlewares personnalisés


// Créer un constructeur d'application web avec les arguments de ligne de commande
var builder = WebApplication.CreateBuilder(args);

// pour le deploiement
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(int.Parse(port));
});

// Configurer Kestrel pour écouter sur toutes les interfaces réseau (0.0.0.0) sur le port 5283
builder.WebHost.UseUrls("http://0.0.0.0:5283");

// Ajouter les services au conteneur de dépendances
// Configurer la base de données avec Entity Framework et SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Ajouter le support des contrôleurs MVC
builder.Services.AddControllers();

// Configurer l'authentification JWT (JSON Web Token)
// Lire les paramètres JWT depuis la configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
// Convertir la clé secrète en bytes pour la signature
var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);

// Configurer l'authentification avec JWT
builder.Services.AddAuthentication(options =>
{
    // Définir JWT comme schéma d'authentification par défaut
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Ne pas exiger HTTPS pour les métadonnées (utile en développement)
    options.RequireHttpsMetadata = false;
    // Sauvegarder le token dans le contexte HTTP
    options.SaveToken = true;
    // Paramètres de validation des tokens JWT
    options.TokenValidationParameters = new TokenValidationParameters
    {
        // Vérifier la signature du token
        ValidateIssuerSigningKey = true,
        // Clé utilisée pour vérifier la signature
        IssuerSigningKey = new SymmetricSecurityKey(key),
        // Vérifier qui a émis le token
        ValidateIssuer = true,
        // Qui peut émettre des tokens valides
        ValidIssuer = jwtSettings["Issuer"],
        // Vérifier pour qui le token est destiné
        ValidateAudience = true,
        // Pour qui les tokens sont destinés
        ValidAudience = jwtSettings["Audience"],
        // Vérifier si le token n'est pas expiré
        ValidateLifetime = true,
        // Pas de tolérance pour l'expiration
        ClockSkew = TimeSpan.Zero
    };
});

// Ajouter une politique CORS (Cross-Origin Resource Sharing)
builder.Services.AddCors(options =>
{
    // Créer une politique qui autorise toutes les origines
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        // Autoriser toutes les origines (sites web)
        policy.AllowAnyOrigin()
              // Autoriser toutes les méthodes HTTP (GET, POST, PUT, DELETE, etc.)
              .AllowAnyMethod()
              // Autoriser tous les en-têtes HTTP
              .AllowAnyHeader();
    });
});

// Configurer Swagger/OpenAPI pour la documentation de l'API
// Ajouter l'explorateur d'endpoints pour Swagger
builder.Services.AddEndpointsApiExplorer();
// Ajouter la génération de documentation Swagger
builder.Services.AddSwaggerGen();


// Enregistrer les services personnalisés dans le conteneur de dépendances
// Service pour envoyer des emails
builder.Services.AddScoped<IEmailService, EmailService>();
// Service pour gérer les tokens JWT
builder.Services.AddScoped<IJwtService, JwtService>();
// Service de nettoyage des tokens expirés (temporairement désactivé)
// builder.Services.AddHostedService<TokenCleanupService>();

// Construire l'application avec tous les services configurés
var app = builder.Build();

// Configurer le pipeline de traitement des requêtes HTTP
// Si l'application est en mode développement
if (app.Environment.IsDevelopment())
{
    // Activer Swagger pour la documentation de l'API
    app.UseSwagger();
    // Activer l'interface utilisateur Swagger
    app.UseSwaggerUI();
}

// Désactiver la redirection HTTPS pour la connectivité de l'application mobile
// app.UseHttpsRedirection();

// Activer CORS avec la politique définie précédemment
app.UseCors("AllowAllOrigins");

// Configurer le chemin pour les fichiers uploadés
// Créer le chemin vers le dossier des images
var uploadPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "images");
// Vérifier si le dossier existe
if (!Directory.Exists(uploadPath))
{
    // Créer le dossier s'il n'existe pas
    Directory.CreateDirectory(uploadPath);
}

// Servir les fichiers statiques depuis le dossier wwwroot/images
app.UseStaticFiles(new StaticFileOptions
{
    // Fournisseur de fichiers physiques pointant vers le dossier d'upload
    FileProvider = new PhysicalFileProvider(uploadPath),
    // Chemin de requête pour accéder aux images (/images)
    RequestPath = "/images"
});

// Activer l'authentification JWT
app.UseAuthentication();
// Utiliser le middleware personnalisé pour vérifier les tokens blacklistés
app.UseMiddleware<JwtBlacklistMiddleware>();
// Activer l'autorisation basée sur les rôles et permissions
app.UseAuthorization();

// Mapper les contrôleurs aux routes
app.MapControllers();

// Ajouter une route par défaut pour tester la connectivité
app.MapGet("/", () => "Axia Livraison API is running!");

// Démarrer l'application
app.Run();