using System;
using System.Text.Json.Serialization;

namespace AxiaLivraisonAPI.Models
{
    public class Notification
    {
        public int Id { get; set; }

        [JsonPropertyName("recipient")]
        public string Destinataire { get; set; }

        [JsonPropertyName("subject")]
        public string Sujet { get; set; }

        [JsonPropertyName("body")]
        public string Contenu { get; set; }

        [JsonPropertyName("sentDate")]
        public DateTime DateEnvoi { get; set; }

        public bool EstLue { get; set; }

        // Command relationship
        public int CommandeId { get; set; }  // Nullable if notifications can exist without commands

        [JsonIgnore]  // Prevents circular references in JSON
        public Commande? Commande { get; set; }
    }
}