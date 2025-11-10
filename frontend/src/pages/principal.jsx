
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
          
          <div className="hero-image-simple">
            <div className="mockup-card-simple">
              <div className="mockup-header-simple">
                <span>Sorteo Amigos Secretos 2025</span>
                <span className="status-badge-simple">Activo</span>
              </div>
              <div className="mockup-content-simple">
                <div className="mockup-item-simple">
                  <span>Participantes:</span>
                  <span>Min: 2</span>
                  <span>Max: 10</span>
                </div>
                <div className="mockup-item-simple">
                  <span>Fecha:</span>
                  <span>17 Noviembre 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;