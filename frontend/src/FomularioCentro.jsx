import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import CampoTextoInput from './components/CampoTextoInput'

function FormularioCentro() {
  //estados para almacenar los datos
  const [centros, setCentros] = useState([]) // Lista de centros
  const [idCentro, setIdCentro] = useState('')
  const [nombreCentro, setNombreCentro] = useState('')
  const [comunaCentro, setComunaCentro] = useState('')
  const [regionCentro, setRegionCentro] = useState('')

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

  //petición POST al enviar el formulario para crear un centro
  const handleSubmit = (e) => {
    e.preventDefault()

    //armamos el objeto con la estructura que espera Django
    const nuevoCentro = {
      id_centro: parseInt(idCentro),
      nombre_centro: nombreCentro,
      comuna_centro: comunaCentro,
      region_centro: regionCentro,
      direccion_centro: null // Se deja en null de forma temporal
    }

    axios.post('http://127.0.0.1:8000/api/centro/', nuevoCentro)
      .then(response => {
        //agregamos el nuevo centro retornado por Django a la lista en pantalla
        setCentros([...centros, response.data])
        //limpiamos los campos del formulario
        setIdCentro('')
        setNombreCentro('')
        setComunaCentro('')
        setRegionCentro('')
      })
      .catch(error => {
        alert('Error al guardar el centro. Asegúrate de usar un ID único.')
        console.error(error)
      })
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Botón para volver al menú principal */}
      <Link to="/">
        <button style={{ backgroundColor: '#6c757d', marginBottom: '20px', cursor: 'pointer' }}>
          ← Volver al Menú Principal
        </button>
      </Link>

      <h1>Gestión de Centros de Vacunación</h1>

      {/* Formulario de Registro */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <h3>Registrar Nuevo Centro</h3>
        <form onSubmit={handleSubmit}>
          <CampoTextoInput
            mensaje="ID Centro"
            tipo_dato="number"
            ejemplo="Ej. 1"
            valor_almacenado={idCentro}
            onChange={(val) => setIdCentro(val)}
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
          <button type="submit">Guardar en Base de Datos</button>
        </form>
      </div>

      {/* Listado de Resultados */}
      <div>
        <h3>Lista de Centros en el Sistema</h3>
        {centros.length === 0 ? (
          <p>No hay centros de vacunación en el sistema.</p>
        ) : (
          <ul>
            {centros.map((c) => (
              <li key={c.id_centro} style={{ marginBottom: '5px' }}>
                <strong>ID:</strong> {c.id_centro} | <strong>Nombre:</strong> {c.nombre_centro} | <strong>Ubicación:</strong> {c.comuna_centro}, {c.region_centro}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default FormularioCentro