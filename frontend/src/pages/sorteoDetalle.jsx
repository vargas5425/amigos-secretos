import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const SorteoDetalle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sorteo, setSorteo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [tokenAcceso, setTokenAcceso] = useState('')

  useEffect(() => {
    cargarSorteo()
  }, [id])

  const cargarSorteo = async () => {
    try {
      const response = await api.get(`/sorteos/${id}`)
      setSorteo(response.data.sorteo)
    } catch (error) {
      setError('Error al cargar el sorteo')
      console.error('Error:', error)
    } finally {
      setCargando(false)
    }
  }

  const realizarSorteo = async () => {
    if (!window.confirm('¿Estás seguro de que quieres realizar el sorteo? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await api.post(`/sorteos/${id}/sortear`)
      setTokenAcceso(response.data.token_acceso)
      await cargarSorteo() // Recargar para ver el nuevo estado
    } catch (error) {
      setError(error.response?.data?.error || 'Error al realizar el sorteo')
      console.error('Error:', error)
    }
  }

  const copiarLinkAcceso = () => {
    const url = `${window.location.origin}/sorteos/acceso/${tokenAcceso}`
    navigator.clipboard.writeText(url)
    alert('Link copiado al portapapeles')
  }

  const copiarLinkBolillo = (tokenBolillo) => {
    const url = `${window.location.origin}/bolillo/${tokenBolillo}`
    navigator.clipboard.writeText(url)
    alert('Link de bolillo copiado al portapapeles')
  }

  if (cargando) {
    return <div className="loading">Cargando...</div>
  }

  if (!sorteo) {
    return <div className="error">Sorteo no encontrado</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1>{sorteo.nombre}</h1>
          <p><strong>Fecha:</strong> {new Date(sorteo.fecha).toLocaleDateString('es-ES')}</p>
          <p><strong>Estado:</strong> {sorteo.estado === 'realizado' ? 'Realizado' : 'Pendiente'}</p>
        </div>
        
        <button 
          onClick={() => navigate('/')}
          className="btn btn-secondary"
        >
          Volver
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <h3>Participantes</h3>
        <ul className="participant-list">
          {sorteo.participantes?.map(participante => (
            <li key={participante.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{participante.nombre}</span>
                {participante.asignado_a && (
                  <span style={{ color: '#28a745' }}>
                    Asignado
                    {participante.token_bolillo && (
                      <button
                        onClick={() => copiarLinkBolillo(participante.token_bolillo)}
                        className="btn btn-secondary"
                        style={{ marginLeft: '10px', fontSize: '12px', padding: '2px 8px' }}
                      >
                        Copiar Link
                      </button>
                    )}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {sorteo.estado === 'pendiente' && (
        <div className="card">
          <h3>Realizar Sorteo</h3>
          <p>Una vez que realices el sorteo, se asignarán los amigos secretos y no podrás modificarlo.</p>
          <button 
            onClick={realizarSorteo}
            className="btn btn-success"
          >
            Realizar Sorteo
          </button>
        </div>
      )}

      {sorteo.estado === 'realizado' && tokenAcceso && (
        <div className="card">
          <h3>Link de Acceso para Participantes</h3>
          <p>Comparte este link con los participantes para que puedan identificar a su amigo secreto:</p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <code style={{ flex: 1, padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
              {window.location.origin}/sorteos/acceso/{tokenAcceso}
            </code>
            <button 
              onClick={copiarLinkAcceso}
              className="btn btn-primary"
            >
              Copiar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SorteoDetalle