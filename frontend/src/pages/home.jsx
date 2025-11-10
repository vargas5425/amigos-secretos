import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import SorteosList from './sorteos/sorteosList'
import SorteoForm from './sorteos/sorteoForm'

const Home = () => {
  const [sorteos, setSorteos] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoSorteo, setEditandoSorteo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarSorteos()
  }, [])

  const cargarSorteos = async () => {
    try {
      const response = await api.get('/sorteos')
      setSorteos(response.data.sorteos)
    } catch (error) {
      setError('Error al cargar los sorteos')
      console.error('Error:', error)
    } finally {
      setCargando(false)
    }
  }

  const crearSorteo = async (datosSorteo) => {
    try {
      if (editandoSorteo) {
        // Si estamos editando, hacer PUT
        await api.put(`/sorteos/${editandoSorteo.id}`, datosSorteo)
      } else {
        // Si es nuevo, hacer POST
        await api.post('/sorteos', datosSorteo)
      }

      await cargarSorteos()
      setMostrarForm(false)
      setEditandoSorteo(null)
    } catch (error) {
      setError('Error al crear o actualizar el sorteo')
      console.error('Error:', error)
    }
  }

  const eliminarSorteo = async (sorteoId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este sorteo?')) return

    try {
      await api.delete(`/sorteos/${sorteoId}`)
      await cargarSorteos()
    } catch (error) {
      setError('Error al eliminar el sorteo')
      console.error('Error:', error)
    }
  }

  const handleEditarSorteo = (sorteo) => {
    setEditandoSorteo(sorteo)
    setMostrarForm(true)
  }

  const cancelarForm = () => {
    setMostrarForm(false)
    setEditandoSorteo(null)
  }

  if (cargando) return <div className="loading">Cargando...</div>

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h1>Mis Sorteos de Amigo Secreto</h1>

        {/* Solo mostrar el botón de crear si no estamos editando ni creando */}
        {!mostrarForm && (
          <button
            onClick={() => {
              setMostrarForm(true)
              setEditandoSorteo(null)
            }}
            className="btn btn-primary"
          >
            Crear Nuevo Sorteo
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {mostrarForm ? (
        <SorteoForm
          sorteo={editandoSorteo}
          onSubmit={crearSorteo}
          onCancel={cancelarForm}
        />
      ) : (
        <SorteosList
          sorteos={sorteos}
          onEliminarSorteo={eliminarSorteo}
          onEditarSorteo={handleEditarSorteo}
        />
      )}
    </div>
  )
}

export default Home
