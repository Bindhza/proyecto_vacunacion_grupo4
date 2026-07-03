import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import CampoTextoInput from './components/CampoTextoInput'

function FormularioCampana() {
  const [campanas, setCampanas] = useState([])
  
  const [id, setId] = useState('')
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [estado, setEstado] = useState(true)

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
        console.error('Error al cargar datos:', error)
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
      estado_campaña: estado
    }

    axios.post('http://127.0.0.1:8000/api/campana_crud/', nuevaCampana)
      .then(response => {
        alert('Campaña creada exitosamente')
        setCampanas([...campanas, response.data])
        setId('')
        setNombre('')
        setDescripcion('')
        setFechaInicio('')
        setFechaFin('')
        setEstado(true)
      })
      .catch(error => {
        console.error('Error al crear campaña:', error)
        alert('Ocurrió un error al crear la campaña.')
      })
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <CampoTextoInput 
                  mensaje="ID Campaña:" 
                  tipo_dato="number" 
                  ejemplo="Ej. 1"
                  valor_almacenado={id} 
                  onChange={(val) => setId(val)} 
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

              <button type="submit" style={{ marginTop: '20px' }}>
                Agregar Campaña
              </button>
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
              {campanas.map((c) => (
                <div key={c.id_campaña} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '5px' }}>{c.nombre_campaña} {c.estado_campaña ? '🟢' : '🔴'}</h3>
                    <p style={{ margin: 0 }}>ID: {c.id_campaña} | Inicio: {c.fecha_inicio} | Fin: {c.fecha_fin}</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.descripcion_campaña}</p>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(c.id_campaña); }}
                      style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', width: 'auto', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', margin: 0 }}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FormularioCampana
