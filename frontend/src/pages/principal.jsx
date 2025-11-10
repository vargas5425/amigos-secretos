
import { Link } from 'react-router-dom';
import '../principal.css';

const LandingPage = () => {
  return (
    <div className="landing-page-simple">
      {/* Navbar Simple */}
      <nav className="navbar-simple">
        <div className="logo">
          <h2>AmigoSecreto</h2>
        </div>
        <div className="nav-buttons">
          <Link to="/login" className="btn btn-outline">Iniciar Sesión</Link>
          <Link to="/register" className="btn btn-primary">Registrarse</Link>
        </div>
      </nav>

      {/* Hero Section Centrada */}
      <div className="hero-simple">
        <div className="hero-content-simple">
          <div className="hero-text-simple">
            <h1>Organiza Sorteos de Amigo Secreto</h1>
            <p className="hero-description-simple">
              La plataforma perfecta para organizar intercambios de regalos con amigos, 
              familia o compañeros de trabajo. Fácil, seguro y divertido.
            </p>
            <div className="hero-buttons-simple">
              <Link to="/register" className="btn btn-large btn-primary">
                Crear Mi Primer Sorteo
              </Link>
              <Link to="/login" className="btn btn-large btn-secondary">
                Ya Tengo Cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;