import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'


const BolilloPage = () => {
  const { token } = useParams() // token_acceso o token_bolillo según la URL
  const navigate = useNavigate()
  const [modo, setModo] = useState('acceso')
  const [sorteo, setSorteo] = useState(null)
  const [participantes, setParticipantes] = useState([])
  const [participanteSeleccionado, setParticipanteSeleccionado] = useState('')
  const [bolillo, setBolillo] = useState(null)
  const [wishlist, setWishlist] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const validarTokenAcceso = async () => {
    try {
      setCargando(true)
      const response = await api.post('/sorteos/acceder', { token })
      setSorteo(response.data.sorteo)
      setParticipantes(response.data.participantes)
      setModo('identificacion')
    } catch (error) {
      setError('Token de acceso inválido o expirado')
      console.error('Error:', error)
    } finally {
      setCargando(false)
    }
  }

  const cargarBolillo = async () => {
    try {
      setCargando(true)
      const response = await api.get(`/sorteos/bolillo/${token}`)
      setBolillo(response.data)
      setWishlist(response.data.participante.wishlist || '')
    } catch (error) {
      setError('Token de bolillo inválido')
      console.error('Error:', error)
    } finally {
      setCargando(false)
    }
  }

    if (window.location.pathname.includes('/sorteos/acceso/')) {
      setModo('acceso')
      validarTokenAcceso()
    } else if (window.location.pathname.includes('/bolillo/')) {
      setModo('bolillo')
      cargarBolillo()
    }
  }, [token])

  

  const identificarParticipante = async () => {
    if (!participanteSeleccionado) {
      setError('Selecciona un participante')
      return
    }

    try {
      setCargando(true)
      const response = await api.post('/sorteos/identificar', {
        token_acceso: token,
        participante_id: participanteSeleccionado
      })

      // Redireccionar al link bolillo con el token recibido
      const tokenBolillo = response.data.token_bolillo
      navigate(`/bolillo/${tokenBolillo}`)
      
    } catch (error) {
      setError(error.response?.data?.error || 'Error al identificar participante')
      console.error('Error:', error)
    } finally {
      setCargando(false)
    }
  }

  
  const actualizarWishlist = async () => {
    try {
      await api.put(`/sorteos/bolillo/${token}/wishlist`, { wishlist })
      alert('Wishlist actualizada exitosamente')
    } catch (error) {
      setError('Error al actualizar la wishlist')
      console.error('Error:', error)
    }
  }

  const copiarLinkBolillo = () => {
    const url = `${window.location.origin}/bolillo/${token}`
    navigator.clipboard.writeText(url)
    alert('Link copiado al portapapeles. Guárdalo para acceder después.')
  }

  if (cargando) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto' }}>
        <div className="card">
          <div className="loading">Cargando...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto' }}>
        <div className="card">
          <div className="error">{error}</div>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      {modo === 'acceso' && (
        <div className="card">
          <h2 style={{ textAlign: 'center' }}>Validando acceso...</h2>
        </div>
      )}

      {modo === 'identificacion' && (
        <div className="card">
          <h2 style={{ textAlign: 'center' }}>¡Hola! ¿Quién eres?</h2>
          <p style={{ textAlign: 'center', marginBottom: '20px' }}>
            Sorteo: <strong>{sorteo?.nombre}</strong>
          </p>
          
          <div className="form-group">
            <label>Selecciona tu nombre:</label>
            <select
              value={participanteSeleccionado}
              onChange={(e) => setParticipanteSeleccionado(e.target.value)}
              className="form-control"
            >
              <option value="">Selecciona un participante</option>
              {participantes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={identificarParticipante}
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={!participanteSeleccionado}
          >
            Identificarme
          </button>
        </div>
      )}

      {modo === 'bolillo' && bolillo && (
        <div className="card">
          <h2 style={{ textAlign: 'center', color: '#28a745' }}>Hola {bolillo.participante?.nombre} ¡Tu Amigo Secreto!</h2>

          
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
            <h3 style={{ color: '#dc3545', textAlign: 'center' }}>
              {bolillo.participante?.asignado?.nombre || bolillo.asignado?.nombre}
            </h3>
            <p style={{ textAlign: 'center', fontStyle: 'italic' }}>
              {bolillo.participante?.asignado?.wishlist || bolillo.asignado?.wishlist || 
               'Esta persona aún no ha compartido su wishlist.'}
            </p>
          </div>

          <div className="form-group">
            <label>Tu Wishlist (opcional):</label>
            <textarea
              value={wishlist}
              onChange={(e) => setWishlist(e.target.value)}
              className="form-control"
              rows="4"
              placeholder="Comparte tus gustos, tallas, hobbies, etc. para ayudar a tu amigo secreto..."
            />
          </div>
          
          <button 
            onClick={actualizarWishlist}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '10px' }}
          >
            Guardar Mi Wishlist
          </button>

          <button 
            onClick={copiarLinkBolillo}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Copiar Mi Link de Acceso
          </button>

          <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '10px' }}>
            Guarda este link para volver a ver tu amigo secreto cuando quieras
          </p>
        </div>
      )}
    </div>
  )
}

export default BolilloPage
