import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import CampoTextoInput from './components/CampoTextoInput'

function FormularioVacuna() {
  // 1. Estados para almacenar los datos
  const [vacunas, setVacunas] = useState([]) // Lista de vacunas
  const [id, setId] = useState('')           // ID para el formulario
  const [nombre, setNombre] = useState('')   // Nombre para el formulario
  const [stock, setStock] = useState('')     // Stock para el formulario

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

  // 3. Petición POST al enviar el formulario para crear una vacuna
  const handleSubmit = (e) => {
    e.preventDefault()

    // Armamos el objeto con la estructura que espera Django
    const nuevaVacuna = {
      id_vacuna: parseInt(id),
      nombre_vacuna: nombre,
      stock_disponible: parseInt(stock)
    }

    axios.post('http://127.0.0.1:8000/api/vacunas/', nuevaVacuna)
      .then(response => {
        // Agregamos la nueva vacuna retornada por Django a la lista en pantalla
        setVacunas([...vacunas, response.data])
        // Limpiamos los campos del formulario
        setId('')
        setNombre('')
        setStock('')
      })
      .catch(error => {
        alert('Error al guardar la vacuna. Asegúrate de usar un ID único.')
        console.error(error)
      })
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
        <p className="subtitle">Registrar Nueva Vacuna</p>
        <form onSubmit={handleSubmit}>
          <CampoTextoInput
            mensaje="ID Vacuna"
            tipo_dato="number"
            ejemplo="Ej. 1"
            valor_almacenado={id}
            onChange={(val) => setId(val)}
          />
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
          <button type="submit">Guardar en Base de Datos</button>
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
              <div key={v.id_vacuna} className="list-item">
                <h3 style={{ fontSize: '1rem', marginBottom: '5px' }}>{v.nombre_vacuna}</h3>
                <p>ID: {v.id_vacuna} | Stock: {v.stock_disponible} unidades</p>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

export default FormularioVacuna
