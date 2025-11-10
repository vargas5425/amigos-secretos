import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
const SorteoForm = ({ sorteo, onSubmit, onCancel }) => {
const [formData, setFormData] = useState({
nombre: '',
fecha: '',
participantes: ['']
})

useEffect(() => {
  const cargarDatos = async () => {
    try {
      if (sorteo && sorteo.id) {
        const res = await api.get(`/sorteos/${sorteo.id}`)
        const datos = res.data.sorteo || res.data

        setFormData({
          nombre: datos.nombre || '',
          fecha: datos.fecha ? datos.fecha.split('T')[0] : '',
          participantes: datos.participantes?.map(p => p.nombre) || ['']
        })
      } else if (sorteo && !sorteo.id) {
        setFormData({
          nombre: sorteo.nombre || '',
          fecha: sorteo.fecha ? sorteo.fecha.split('T')[0] : '',
          participantes: sorteo.participantes?.length ? sorteo.participantes : ['']
        })
      } else {
        setFormData({ nombre: '', fecha: '', participantes: [''] })
      }
    } catch (error) {
      console.error('Error al cargar datos del sorteo:', error)
    }
  }

  cargarDatos()
}, [sorteo])


const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  })
}

const handleParticipanteChange = (index, value) => {
    const nuevosParticipantes = [...formData.participantes]
    nuevosParticipantes[index] = value
    setFormData({
      ...formData,
      participantes: nuevosParticipantes
  })
}

const agregarParticipante = () => {
  setFormData({
    ...formData,
    participantes: [...formData.participantes, '']
  })
}

const eliminarParticipante = (index) => {
  if (formData.participantes.length > 1) {
  const nuevosParticipantes = formData.participantes.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      participantes: nuevosParticipantes
    })
  }
}

const handleSubmit = (e) => {
  e.preventDefault()
  // Filtrar participantes vacíos
  const participantesFiltrados = formData.participantes.filter(p => p.trim() !== '')

  if (participantesFiltrados.length < 2) {
    alert('Debe haber al menos 2 participantes')
    return
  }
  onSubmit({
    ...formData,
    participantes: participantesFiltrados
  })
}

return (
<div className="card">
<h3>{sorteo ? 'Editar Sorteo' : 'Crear Nuevo Sorteo'}</h3>

  <form onSubmit={handleSubmit}>
    <div className="form-group">
      <label>Nombre del Sorteo:</label>
      <input
        type="text"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        className="form-control"
        required
      />
    </div>

    <div className="form-group">
      <label>Fecha del Sorteo:</label>
      <input
        type="date"
        name="fecha"
        value={formData.fecha}
        onChange={handleChange}
        className="form-control"
        required
      />
    </div>

    <div className="form-group">
      <label>Participantes:</label>
      {formData.participantes.map((participante, index) => (
        <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
          <input
            type="text"
            value={participante}
            onChange={(e) => handleParticipanteChange(index, e.target.value)}
            className="form-control"
            placeholder={`Participante ${index + 1}`}
            style={{ marginRight: '10px' }}
          />

          <button
            type="button"
            onClick={() => eliminarParticipante(index)}
            className="btn btn-danger"
            disabled={formData.participantes.length === 1}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={agregarParticipante}
        className="btn btn-secondary"
      >
        + Agregar Participante
      </button>
    </div>

    <div style={{ display: 'flex', gap: '10px' }}>
      <button type="submit" className="btn btn-primary">
        {sorteo ? 'Actualizar' : 'Crear'} Sorteo
      </button>
      <button type="button" onClick={onCancel} className="btn btn-secondary">
        Cancelar
      </button>
    </div>
  </form>
</div>
)
}

export default SorteoForm