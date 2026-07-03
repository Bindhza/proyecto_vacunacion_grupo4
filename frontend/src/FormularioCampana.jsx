import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import CampoTextoInput from './components/CampoTextoInput'
import CampoTextoOptions from './components/CampoTextoOptions'

function FormularioCampana() {
  const [campanas, setCampanas] = useState([])
  
  const [id, setId] = useState('')
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [estado, setEstado] = useState(true)
  const [centro, setCentro] = useState('')
  const [vacuna, setVacuna] = useState('')
  const [centrosList, setCentrosList] = useState([])
  const [vacunasList, setVacunasList] = useState([])
  const [isEditing, setIsEditing] = useState(false)

  const user = JSON.parse(localStorage.getItem('user'))
  const isAdmin = user && user.rol === 'Admin'

  const getTodayYMD = () => {
    const dateObj = new Date();
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const today = getTodayYMD();

  let minFechaFin = today;
  if (fechaInicio) {
    const [y, m, d] = fechaInicio.split('-');
    const dObj = new Date(y, m - 1, d);
    dObj.setDate(dObj.getDate() + 1);
    const ny = dObj.getFullYear();
    const nm = String(dObj.getMonth() + 1).padStart(2, '0');
    const nd = String(dObj.getDate()).padStart(2, '0');
    minFechaFin = `${ny}-${nm}-${nd}`;
  } else {
    const dObj = new Date();
    dObj.setDate(dObj.getDate() + 1);
    const ny = dObj.getFullYear();
    const nm = String(dObj.getMonth() + 1).padStart(2, '0');
    const nd = String(dObj.getDate()).padStart(2, '0');
    minFechaFin = `${ny}-${nm}-${nd}`;
  }

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/campana_crud/')
      .then(response => {
        setCampanas(response.data)
      })
      .catch(error => {
        console.error('Error al cargar campañas:', error)
      })

    axios.get('http://127.0.0.1:8000/api/centro/')
      .then(response => {
        setCentrosList(response.data)
      })
      .catch(error => {
        console.error('Error al cargar centros:', error)
      })
      
    axios.get('http://127.0.0.1:8000/api/vacunas/')
      .then(response => {
        setVacunasList(response.data)
      })
      .catch(error => {
        console.error('Error al cargar vacunas:', error)
      })
  }, [])

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta campaña?')) {
      axios.delete(`http://127.0.0.1:8000/api/campana_crud/${id}/`)
        .then(() => {
          setCampanas(campanas.filter(c => c.id_campaña !== id))
        })
        .catch(error => {
          alert('Error al eliminar la campaña. Podría estar asociada a citas u otros registros.')
          console.error(error)
        })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (fechaInicio < today) {
      alert('La fecha de inicio no puede ser en el pasado.');
      return;
    }

    if (fechaFin <= fechaInicio) {
      alert('La fecha de fin debe ser estrictamente posterior a la fecha de inicio.');
      return;
    }

    const nuevaCampana = {
      id_campaña: parseInt(id),
      nombre_campaña: nombre,
      descripcion_campaña: descripcion,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      estado_campaña: estado,
      centro_vacunacion: centro ? parseInt(centro) : null,
      vacuna: vacuna ? parseInt(vacuna) : null
    }

    if (isEditing) {
      axios.put(`http://127.0.0.1:8000/api/campana_crud/${id}/`, nuevaCampana)
        .then(response => {
          alert('Campaña actualizada exitosamente')
          setCampanas(campanas.map(c => c.id_campaña === parseInt(id) ? response.data : c))
          resetForm()
        })
        .catch(error => {
          console.error('Error al actualizar campaña:', error)
          alert('Ocurrió un error al actualizar la campaña.')
        })
    } else {
      axios.post('http://127.0.0.1:8000/api/campana_crud/', nuevaCampana)
        .then(response => {
          alert('Campaña creada exitosamente')
          setCampanas([...campanas, response.data])
          resetForm()
        })
        .catch(error => {
          console.error('Error al crear campaña:', error)
          alert('Ocurrió un error al crear la campaña.')
        })
    }
  }

  const resetForm = () => {
    setId('')
    setNombre('')
    setDescripcion('')
    setFechaInicio('')
    setFechaFin('')
    setEstado(true)
    setCentro('')
    setVacuna('')
    setIsEditing(false)
  }

  const handleEditClick = (c) => {
    setId(c.id_campaña.toString())
    setNombre(c.nombre_campaña)
    setDescripcion(c.descripcion_campaña)
    setFechaInicio(c.fecha_inicio)
    setFechaFin(c.fecha_fin)
    setEstado(c.estado_campaña)
    setCentro(c.centro_vacunacion ? c.centro_vacunacion.toString() : '')
    setVacuna(c.vacuna ? c.vacuna.toString() : '')
    setIsEditing(true)
    window.scrollTo(0, 0)
  }

  return (
    <div className="bpmn-interface-root">
      <div className="glass-container" style={{ maxWidth: '800px' }}>
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

        <h2 style={{ marginBottom: '20px' }}>Gestión de Campañas</h2>

        {isAdmin ? (
          <>
            <form onSubmit={handleSubmit} style={{ textAlign: 'left', marginBottom: '40px' }}>
              <p className="subtitle">{isEditing ? 'Editar Campaña' : 'Registrar Nueva Campaña'}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <CampoTextoInput 
                  mensaje="ID Campaña (No se puede cambiar si editas):" 
                  tipo_dato="number" 
                  ejemplo="Ej. 1"
                  valor_almacenado={id} 
                  onChange={(val) => !isEditing && setId(val)} 
                />
                <CampoTextoInput 
                  mensaje="Nombre de Campaña:" 
                  tipo_dato="text" 
                  ejemplo="Ej. Campaña Invierno 2026"
                  valor_almacenado={nombre} 
                  onChange={(val) => setNombre(val)} 
                />
              </div>

              <div style={{ marginTop: '15px' }}>
                <CampoTextoInput 
                  mensaje="Descripción:" 
                  tipo_dato="text" 
                  ejemplo="Ej. Vacunación contra la Influenza"
                  valor_almacenado={descripcion} 
                  onChange={(val) => setDescripcion(val)} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <CampoTextoInput 
                  mensaje="Fecha Inicio:" 
                  tipo_dato="date" 
                  ejemplo=""
                  valor_almacenado={fechaInicio} 
                  onChange={(val) => setFechaInicio(val)} 
                  min={today}
                />
                <CampoTextoInput 
                  mensaje="Fecha Fin:" 
                  tipo_dato="date" 
                  ejemplo=""
                  valor_almacenado={fechaFin} 
                  onChange={(val) => setFechaFin(val)} 
                  min={minFechaFin}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <CampoTextoOptions 
                  mensaje="Centro Asociado:" 
                  data_type={centrosList}
                  default_value="-- Seleccione Centro --"
                  valor_almacenado={centro} 
                  onChange={(val) => setCentro(val)} 
                />
                <CampoTextoOptions 
                  mensaje="Vacuna Asociada:" 
                  data_type={vacunasList}
                  default_value="-- Seleccione Vacuna --"
                  valor_almacenado={vacuna} 
                  onChange={(val) => setVacuna(val)} 
                />
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label>Estado de Campaña:</label>
                <select 
                  value={estado} 
                  onChange={(e) => setEstado(e.target.value === 'true')}
                  required
                >
                  <option value="true">Vigente / Activa</option>
                  <option value="false">Finalizada / Inactiva</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit">
                  {isEditing ? 'Actualizar Campaña' : 'Agregar Campaña'}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white' }}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No tienes permisos para crear campañas.</p>
        )}

        <div style={{ textAlign: 'left' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Campañas Registradas</h3>
          {campanas.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No hay campañas registradas.</p>
          ) : (
            <div>
              {campanas.map((c) => {
                const cNombre = centrosList.find(x => x.id_centro === c.centro_vacunacion)?.nombre_centro || 'No asignado';
                const vNombre = vacunasList.find(x => x.id_vacuna === c.vacuna)?.nombre_vacuna || 'No asignada';
                return (
                <div key={c.id_campaña} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '5px' }}>{c.nombre_campaña} {c.estado_campaña ? '🟢' : '🔴'}</h3>
                    <p style={{ margin: 0 }}>ID: {c.id_campaña} | Inicio: {c.fecha_inicio} | Fin: {c.fecha_fin}</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.descripcion_campaña} | Centro: {cNombre} | Vacuna: {vNombre}</p>
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
                        onClick={(e) => { e.stopPropagation(); handleDelete(c.id_campaña); }}
                        style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', width: 'auto', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', margin: 0, fontSize: '0.85rem' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FormularioCampana
