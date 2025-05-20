import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TrackingSearch.css';

export function TrackingSearch() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      setError('Veuillez entrer un numéro de suivi');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5283/api/commandes/details/code/${trackingNumber}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Commande non trouvée');
        }
        throw new Error('Erreur lors de la recherche');
      }

      const data = await response.json();
      // Store the commandeId in the state when navigating
      navigate(`/commande/${trackingNumber}`, { 
        state: { commandeDetails: data } 
      });
      setError(null);
      setTrackingNumber('');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Numéro de suivi invalide ou commande non trouvée');
    }
  };

  return (
    <div className="tracking-search-container">
      <form onSubmit={handleSubmit} className="tracking-search-form">
        <div className="tracking-input-wrapper">
          <input
            type="text"
            placeholder="Entrez votre code de suivi"
            value={trackingNumber}
            onChange={(e) => {
              setTrackingNumber(e.target.value);
              setError(null);
            }}
            className="tracking-input"
          />
        </div>
        <button type="submit" className="tracking-button">
          Suivre
        </button>
      </form>
      {error && <div className="tracking-error">{error}</div>}
    </div>
  );
}









