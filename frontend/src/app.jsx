import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import useAuth from './hooks/useAuth.js'
import Navbar from './components/navbar'
import LandingPage from './pages/principal' 
import Home from './pages/home'
import LoginForm from './pages/auth/loginForm'
import RegisterForm from './pages/auth/registerForm'
import SorteoDetalle from './pages/sorteoDetalle'
import BolilloPage from './pages/bolilloPage'

function App() {
  const { usuario } = useAuth()
  const location = useLocation()

  const hideNavbarRoutes = ['/sorteos/acceso', '/bolillo']
  const shouldHideNavbar = hideNavbarRoutes.some(route => location.pathname.startsWith(route))

  return (
    <div className="App">
      {usuario && !shouldHideNavbar && <Navbar />}
      <div className="container">
        <Routes>
          <Route 
            path="/login" 
            element={!usuario ? <LoginForm /> : <Navigate to="/home" />} 
          />
          <Route 
            path="/register" 
            element={!usuario ? <RegisterForm /> : <Navigate to="/home" />} 
          />
          <Route 
            path="/" 
            element={usuario ? <Home /> : <LandingPage />} 
          />
          <Route 
            path="/sorteos/:id" 
            element={usuario ? <SorteoDetalle /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/sorteos/acceso/:token" 
            element={<BolilloPage />} 
          />
          <Route 
            path="/bolillo/:token" 
            element={<BolilloPage />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  )
}

export default App