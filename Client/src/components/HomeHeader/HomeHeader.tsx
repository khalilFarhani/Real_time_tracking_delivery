import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import './HomeHeader.css';

export function HomeHeader() {
  return (
    <header className="home-header">
      <Link to="/" className="home-logo-container">
        <img src={logo} alt="Logo" className="home-logo" />
      </Link>
    </header>
  );
}