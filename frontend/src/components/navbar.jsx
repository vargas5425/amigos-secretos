import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

const Navbar = () => {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/') 
  }

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Amigo Secreto
        </Link>
        <ul className="navbar-nav">
          {usuario ? (
            <>
              <li>
                <Link to="/">Mis Sorteos</Link>
              </li>
              <li>
                <span className="colr">Hola, {usuario.nombre}</span>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ padding: '5px 10px', fontSize: '14px' }}
                >
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Iniciar sesión</Link>
              </li>
              <li>
                <Link to="/register">Registrarse</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
