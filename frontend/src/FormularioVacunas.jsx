import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import CampoTextoInput from './components/CampoTextoInput'
import ModalMensaje from './components/ModalMensaje'

function FormularioVacuna() {
  // 1. Estados para almacenar los datos
  const [vacunas, setVacunas] = useState([]) // Lista de vacunas
  const [id, setId] = useState('')           // ID para el formulario
  const [nombre, setNombre] = useState('')   // Nombre para el formulario
  const [stock, setStock] = useState('')     // Stock para el formulario
  const [isEditing, setIsEditing] = useState(false)
  const [modalInfo, setModalInfo] = useState({ show: false, mensaje: '', esError: false, esConfirm: false, onConfirm: null })

  // 2. Petición GET al cargar la página para listar las vacunas
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/vacunas/')
      .then(response => {
        setVacunas(response.data) // Guardamos las vacunas que nos da Django
      })
      .catch(error => {
        console.error('Error al cargar datos:', error)
      })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()

    let currentId = parseInt(id)
    if (!isEditing) {
      // Auto-increment: busca el ID máximo actual y suma 1
      const maxId = vacunas.length > 0 ? Math.max(...vacunas.map(v => v.id_vacuna)) : 0
      currentId = maxId + 1
    }

    const nuevaVacuna = {
      id_vacuna: currentId,
      nombre_vacuna: nombre,
      stock_disponible: parseInt(stock)
    }

    if (isEditing) {
      axios.put(`http://127.0.0.1:8000/api/vacunas/${currentId}/`, nuevaVacuna)
        .then(response => {
          setVacunas(vacunas.map(v => v.id_vacuna === currentId ? response.data : v))
          resetForm()
          setModalInfo({ show: true, mensaje: 'Vacuna actualizada exitosamente.', esError: false, esConfirm: false })
        })
        .catch(error => {
          setModalInfo({ show: true, mensaje: 'Error al actualizar la vacuna.', esError: true, esConfirm: false })
          console.error(error)
        })
    } else {
      axios.post('http://127.0.0.1:8000/api/vacunas/', nuevaVacuna)
        .then(response => {
          setVacunas([...vacunas, response.data])
          resetForm()
          setModalInfo({ show: true, mensaje: 'Vacuna creada exitosamente.', esError: false, esConfirm: false })
        })
        .catch(error => {
          setModalInfo({ show: true, mensaje: 'Error al guardar la vacuna. Intenta de nuevo.', esError: true, esConfirm: false })
          console.error(error)
        })
    }
  }

  const resetForm = () => {
    setId('')
    setNombre('')
    setStock('')
    setIsEditing(false)
  }

  const handleEditClick = (v) => {
    setId(v.id_vacuna.toString())
    setNombre(v.nombre_vacuna)
    setStock(v.stock_disponible.toString())
    setIsEditing(true)
    window.scrollTo(0, 0)
  }

  const handleDelete = (id_vacuna_a_eliminar) => {
    setModalInfo({
      show: true,
      mensaje: '¿Estás seguro de que deseas eliminar esta vacuna?',
      esError: false,
      esConfirm: true,
      onConfirm: () => {
        axios.delete(`http://127.0.0.1:8000/api/vacunas/${id_vacuna_a_eliminar}/`)
          .then(() => {
            setVacunas(vacunas.filter(v => v.id_vacuna !== id_vacuna_a_eliminar))
            setModalInfo({ show: false, mensaje: '', esError: false, esConfirm: false })
          })
          .catch(error => {
            setModalInfo({ show: true, mensaje: 'Error al eliminar la vacuna. Podría estar asociada a registros existentes.', esError: true, esConfirm: false })
            console.error(error)
          })
      }
    });
  }

  return (
    <div className="bpmn-interface-root">
      <div className="glass-container">
        {/* Botón para volver al menú principal */}
        <div style={{ textAlign: 'left', marginBottom: '15px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button style={{ 
              background: 'transparent', 
              border: '1px solid var(--glass-border)', 
              color: 'var(--text-muted)', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '0.9rem',
              width: 'auto',
              marginTop: 0,
              display: 'inline-block'
            }}>
              ← Volver
            </button>
          </Link>
        </div>

      <h2>Gestión de Vacunas</h2>

      {/* Formulario de Registro */}
      <div>
        <p className="subtitle">{isEditing ? 'Editar Vacuna' : 'Registrar Nueva Vacuna'}</p>
        <form onSubmit={handleSubmit}>
          {isEditing && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>ID de Vacuna (Modo Edición)</label>
              <input type="text" value={id} disabled style={{ backgroundColor: 'rgba(255,255,255,0.1)', cursor: 'not-allowed', color: '#94a3b8' }} />
            </div>
          )}
          <CampoTextoInput
            mensaje="Nombre"
            tipo_dato="text"
            ejemplo="Ej. Pfizer"
            valor_almacenado={nombre}
            onChange={(val) => setNombre(val)}
          />
          <CampoTextoInput
            mensaje="Stock"
            tipo_dato="number"
            ejemplo="Ej. 100"
            valor_almacenado={stock}
            onChange={(val) => setStock(val)}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit">{isEditing ? 'Actualizar Vacuna' : 'Guardar en Base de Datos'}</button>
            {isEditing && (
              <button type="button" onClick={resetForm} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Listado de Resultados */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: 'var(--text-main)', textAlign: 'left' }}>Lista de Vacunas en el Sistema</h3>
        {vacunas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No hay vacunas en el sistema.</p>
        ) : (
          <div>
            {vacunas.map((v) => (
              <div key={v.id_vacuna} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '5px' }}>{v.nombre_vacuna}</h3>
                  <p style={{ margin: 0 }}>ID: {v.id_vacuna} | Stock: {v.stock_disponible} unidades</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleEditClick(v)}
                    style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: '#3b82f6', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(v.id_vacuna)}
                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      <ModalMensaje 
        show={modalInfo.show} 
        mensaje={modalInfo.mensaje} 
        esError={modalInfo.esError} 
        esConfirm={modalInfo.esConfirm}
        onConfirm={modalInfo.onConfirm}
        onClose={() => setModalInfo({ show: false, mensaje: '', esError: false, esConfirm: false })} 
      />
    </div>
  )
}

export default FormularioVacuna
