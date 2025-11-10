import React from 'react'
import { Link } from 'react-router-dom'

const SorteosList = ({ sorteos, onEliminarSorteo, onEditarSorteo }) => {
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEstadoBadge = (sorteo) => {
    if (sorteo.estado === 'realizado') {
      return <span style={{ background: '#28a745', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>Realizado</span>
    }
    return <span style={{ background: '#ffc107', color: 'black', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>Pendiente</span>
  }

  const puedeEliminar = (sorteo) => {
    return sorteo.estado === 'pendiente'
  }

  const puedeEditar = (sorteo) => {
    return sorteo.estado === 'pendiente'
  }

  return (
    <div>
      <h2>Mis Sorteos</h2>
      
      {sorteos.length === 0 ? (
        <div className="card">
          <p>No tienes sorteos creados. ¡Crea tu primer sorteo!</p>
        </div>
      ) : (
        sorteos.map(sorteo => (
          <div key={sorteo.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h4>{sorteo.nombre}</h4>
                <p><strong>Fecha:</strong> {formatearFecha(sorteo.fecha)}</p>
                <p><strong>Participantes:</strong> {sorteo.total_participantes}</p>
                <p><strong>Estado:</strong> {getEstadoBadge(sorteo)}</p>
                
                {sorteo.estado === 'realizado' && sorteo.asignados > 0 && (
                  <p><strong>Asignaciones:</strong> {sorteo.asignados}/{sorteo.total_participantes}</p>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link 
                  to={`/sorteos/${sorteo.id}`}
                  className="btn btn-primary"
                  style={{ fontSize: '14px', padding: '8px 12px' }}
                >
                  Ver Detalles
                </Link>

                {puedeEditar(sorteo) && (
                  <button
                    onClick={() => onEditarSorteo(sorteo)}
                    className="btn btn-warning"
                    style={{ fontSize: '14px', padding: '8px 12px' }}
                  >
                    Editar
                  </button>
                )}
                
                {puedeEliminar(sorteo) && (
                  <button
                    onClick={() => onEliminarSorteo(sorteo.id)}
                    className="btn btn-danger"
                    style={{ fontSize: '14px', padding: '8px 12px' }}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default SorteosList