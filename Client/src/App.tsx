import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Header } from './components/Header/Header';
import { TrackingSearch } from './components/TrackingSearch/TrackingSearch';

import { Footer } from './components/Footer/Footer';
import { CommandeDetails } from './pages/commande/CommandeDetails';
import { CommandeLocation } from './pages/commande/CommandeLocation';
import { NotificationDetail } from './pages/notification/NotificationDetail';
import logo from './assets/icons/logo.png';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';


function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={
            <>
              <main className="main-content">
                <div className="hero-section">
                  <img src={logo} alt="Logo" className="logo-large" />
                  <h1 className="hero-title">
                    Suivez votre colis <span className="temps-reel-hero">en temps réel</span>
                  </h1>
                  <p className="hero-subtitle">
                    Entrez votre numéro de suivi pour obtenir instantanément des informations détaillées sur l'état de votre livraison.
                  </p>
                  <TrackingSearch />
                </div>

                <section className="features-section">
                  <h2 className="features-title">Pourquoi nous choisir ?</h2>
                  <div className="features-grid">
                    <div className="feature-card">
                      <LocalShippingIcon className="feature-icon" />
                      <h3>Suivi en Temps Réel</h3>
                      <p>Localisez votre colis à tout moment avec une précision maximale</p>
                    </div>
                    <div className="feature-card">
                      <AccessTimeIcon className="feature-icon" />
                      <h3>Mises à Jour Instantanées</h3>
                      <p>Recevez des notifications en temps réel sur l'état de votre livraison</p>
                    </div>
                    <div className="feature-card">
                      <SecurityIcon className="feature-icon" />
                      <h3>Sécurité Garantie</h3>
                      <p>Vos informations sont protégées avec les dernières technologies de sécurité</p>
                    </div>
                    <div className="feature-card">
                      <SupportAgentIcon className="feature-icon" />
                      <h3>Support 24/7</h3>
                      <p>Une équipe dédiée à votre service pour répondre à toutes vos questions</p>
                    </div>
                  </div>
                </section>

                <section className="how-it-works">
                  <h2 className="section-title">Comment ça marche ?</h2>
                  <div className="steps-container">
                    <div className="step">
                      <div className="step-number">1</div>
                      <h3>Entrez votre numéro</h3>
                      <p>Saisissez votre numéro de suivi dans la barre de recherche</p>
                    </div>
                    <div className="step">
                      <div className="step-number">2</div>
                      <h3>Suivez en direct</h3>
                      <p>Visualisez la position et le statut de votre colis</p>
                    </div>
                    <div className="step">
                      <div className="step-number">3</div>
                      <h3>Restez informé</h3>
                      <p>Recevez des notifications à chaque étape de la livraison</p>
                    </div>
                    <div className="step">
                      <div className="step-number">4</div>
                      <h3>Réception garantie</h3>
                      <p>Confirmez la livraison et évaluez notre service</p>
                    </div>
                  </div>
                </section>


              </main>
              <Footer />
            </>
          } />
          <Route path="/commande/:id" element={
            <>
              <Header />
              <main className="main-content">
                <CommandeDetails />
              </main>
              <Footer />
            </>
          } />
          <Route path="/commande/:id/location" element={
            <>
              <Header />
              <main className="main-content">
                <CommandeLocation />
              </main>
              <Footer />
            </>
          } />
          <Route path="/notification/:id" element={
            <>
              <Header />
              <main className="main-content">
                <NotificationDetail />
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;









