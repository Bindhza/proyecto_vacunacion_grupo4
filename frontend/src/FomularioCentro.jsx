import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import CampoTextoInput from './components/CampoTextoInput'
import ModalMensaje from './components/ModalMensaje'

function FormularioCentro() {
  //estados para almacenar los datos
  const [centros, setCentros] = useState([]) // Lista de centros
  const [idCentro, setIdCentro] = useState('')
  const [nombreCentro, setNombreCentro] = useState('')
  const [comunaCentro, setComunaCentro] = useState('')
  const [regionCentro, setRegionCentro] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [modalInfo, setModalInfo] = useState({ show: false, mensaje: '', esError: false, esConfirm: false, onConfirm: null })

  const user = JSON.parse(localStorage.getItem('user'))
  const isAdmin = user && user.rol === 'Admin'

  // Petición GET al cargar la página para listar los centros
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/centro/')
      .then(response => {
        setCentros(response.data)
      })
      .catch(error => {
        console.error('Error al cargar datos de centros:', error)
      })
  }, [])

  const handleDelete = (id) => {
    setModalInfo({
      show: true,
      mensaje: '¿Estás seguro de que deseas eliminar este centro?',
      esError: false,
      esConfirm: true,
      onConfirm: () => {
        axios.delete(`http://127.0.0.1:8000/api/centro/${id}/`)
          .then(() => {
            setCentros(centros.filter(c => c.id_centro !== id))
            setModalInfo({ show: false, mensaje: '', esError: false, esConfirm: false })
          })
          .catch(error => {
            setModalInfo({ show: true, mensaje: 'Error al eliminar el centro. Puede que tenga citas o personal asociado.', esError: true, esConfirm: false })
            console.error(error)
          })
      }
    });
  }

  //petición POST al enviar el formulario para crear un centro
  const handleSubmit = (e) => {
    e.preventDefault()

    const nuevoCentro = {
      id_centro: parseInt(idCentro),
      nombre_centro: nombreCentro,
      comuna_centro: comunaCentro,
      region_centro: regionCentro,
      direccion_centro: null 
    }

    if (isEditing) {
      axios.put(`http://127.0.0.1:8000/api/centro/${idCentro}/`, nuevoCentro)
        .then(response => {
          setCentros(centros.map(c => c.id_centro === parseInt(idCentro) ? response.data : c))
          resetForm()
          setModalInfo({ show: true, mensaje: 'Centro actualizado exitosamente.', esError: false, esConfirm: false })
        })
        .catch(error => {
          setModalInfo({ show: true, mensaje: 'Error al actualizar el centro.', esError: true, esConfirm: false })
          console.error(error)
        })
    } else {
      axios.post('http://127.0.0.1:8000/api/centro/', nuevoCentro)
        .then(response => {
          setCentros([...centros, response.data])
          resetForm()
          setModalInfo({ show: true, mensaje: 'Centro creado exitosamente.', esError: false, esConfirm: false })
        })
        .catch(error => {
          setModalInfo({ show: true, mensaje: 'Error al guardar el centro. Asegúrate de usar un ID único.', esError: true, esConfirm: false })
          console.error(error)
        })
    }
  }

  const resetForm = () => {
    setIdCentro('')
    setNombreCentro('')
    setComunaCentro('')
    setRegionCentro('')
    setIsEditing(false)
  }

  const handleEditClick = (c) => {
    setIdCentro(c.id_centro.toString())
    setNombreCentro(c.nombre_centro)
    setComunaCentro(c.comuna_centro)
    setRegionCentro(c.region_centro)
    setIsEditing(true)
    window.scrollTo(0, 0)
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

      <h2>Gestión de Centros</h2>

      {/* Formulario de Registro */}
      <div>
        <p className="subtitle">{isEditing ? 'Editar Centro' : 'Registrar Nuevo Centro'}</p>
        <form onSubmit={handleSubmit}>
          <CampoTextoInput
            mensaje="ID Centro (No se puede cambiar si editas)"
            tipo_dato="number"
            ejemplo="Ej. 1"
            valor_almacenado={idCentro}
            onChange={(val) => !isEditing && setIdCentro(val)}
          />
          <CampoTextoInput
            mensaje="Nombre Centro"
            tipo_dato="text"
            ejemplo="Ej. Centro Sur"
            valor_almacenado={nombreCentro}
            onChange={(val) => setNombreCentro(val)}
          />
          <CampoTextoInput
            mensaje="Comuna"
            tipo_dato="text"
            ejemplo="Ej. Santiago"
            valor_almacenado={comunaCentro}
            onChange={(val) => setComunaCentro(val)}
          />
          <CampoTextoInput
            mensaje="Región"
            tipo_dato="text"
            ejemplo="Ej. Metropolitana"
            valor_almacenado={regionCentro}
            onChange={(val) => setRegionCentro(val)}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit">{isEditing ? 'Actualizar Centro' : 'Guardar en Base de Datos'}</button>
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
        <h3 style={{ marginBottom: '15px', color: 'var(--text-main)', textAlign: 'left' }}>Lista de Centros en el Sistema</h3>
        {centros.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No hay centros de vacunación en el sistema.</p>
        ) : (
          <div>
            {centros.map((c) => (
              <div key={c.id_centro} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '5px' }}>{c.nombre_centro}</h3>
                  <p style={{ margin: 0 }}>ID: {c.id_centro} | {c.comuna_centro}, {c.region_centro}</p>
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEditClick(c); }}
                      style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: '#3b82f6', width: 'auto', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', margin: 0, fontSize: '0.85rem' }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(c.id_centro); }}
                      style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', width: 'auto', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', margin: 0, fontSize: '0.85rem' }}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
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

export default FormularioCentro