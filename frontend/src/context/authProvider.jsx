import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import AuthContext from './authContext'

const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const usuarioStorage = localStorage.getItem('usuario')
    if (token && usuarioStorage) {
      setUsuario(JSON.parse(usuarioStorage))
      api.defaults.headers.Authorization = token
    }
    setCargando(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, usuario } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('usuario', JSON.stringify(usuario))
      api.defaults.headers.Authorization = token
      setUsuario(usuario)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Error al iniciar sesión' }
    }
  }

  const register = async (nombre, email, password) => {
    try {
      await api.post('/auth/registrar', { nombre, email, password })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Error al registrar usuario' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    delete api.defaults.headers.Authorization
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
