using AxiaLivraisonAPI.Data;
using AxiaLivraisonAPI.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using System.IO;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AxiaLivraisonAPI.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to listen on all interfaces
builder.WebHost.UseUrls("http://0.0.0.0:5283");

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Register services
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IJwtService, JwtService>();
// Temporairement désactivé jusqu'à la migration
// builder.Services.AddHostedService<TokenCleanupService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Disable HTTPS redirection for mobile app connectivity
// app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowAllOrigins");

// Configure the path for uploaded files
var uploadPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "images");
if (!Directory.Exists(uploadPath))
{
    Directory.CreateDirectory(uploadPath);
}

// Serve static files from the wwwroot/images folder
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadPath),
    RequestPath = "/images"
});

app.UseAuthentication();
app.UseMiddleware<JwtBlacklistMiddleware>();
app.UseAuthorization();

app.MapControllers();

// Add a default route for testing connectivity
app.MapGet("/", () => "Axia Livraison API is running!");

app.Run();