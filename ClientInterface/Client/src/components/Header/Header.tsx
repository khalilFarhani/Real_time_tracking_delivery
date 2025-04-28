import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconButton, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationsIcon from '@mui/icons-material/Notifications';
import logo from '../../assets/images/logo.png';
import './Header.css';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Veuillez entrer un code de suivi');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5283/api/commandes/details/code/${searchQuery}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Commande non trouvée');
        }
        throw new Error('Erreur lors de la recherche');
      }

      const data = await response.json();
      navigate(`/commande/${searchQuery}`, { state: { commandeDetails: data } });
      setError(null);
      setSearchQuery('');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Code de suivi invalide ou commande non trouvée');
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          <span className="brand-name">Axia Livraison</span>
        </Link>

        <form onSubmit={handleSearch} className="search-container">
          <SearchIcon className="search-icon" />
          <InputBase
            placeholder="Rechercher par code de suivi"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setError(null);
            }}
            className="search-input"
          />
          {error && <div className="search-error">{error}</div>}
        </form>

        <div className="action-buttons">
          <IconButton 
            className="action-button"
            onClick={() => window.location.reload()}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton className="action-button">
            <NotificationsIcon />
          </IconButton>
        </div>
      </div>
    </header>
  );
}




