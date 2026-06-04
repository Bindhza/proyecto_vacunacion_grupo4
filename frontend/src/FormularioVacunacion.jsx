import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function FormularioVacuna() {
    //almacenamiento del estado de datos
    const [rut_vacunado, setVacunas] = useState([])
    const [fecha_vacunacion, setId] = useState('')
    const [nombre, setNombre] = useState('')
    const [stock, setStock] = useState('')
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
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>

            {/* Botón para volver al menú principal */}
            <Link to="/">
                <button style={{ backgroundColor: '#6c757d', marginBottom: '20px', cursor: 'pointer' }}>
                    ← Volver al Menú Principal
                </button>
            </Link>

            <h1>Gestión de Vacunas (Ejemplo Básico)</h1>

            {/* Formulario de Registro */}
            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
                <h3>Registrar Nueva Vacuna</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <label>ID Vacuna: </label>
                        <input
                            type="number"
                            placeholder="Ej. 1"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Nombre: </label>
                        <input
                            type="text"
                            placeholder="Ej. Pfizer"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Stock: </label>
                        <input
                            type="number"
                            placeholder="Ej. 100"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
                    </div>
                    <button type="submit">Guardar en Base de Datos</button>
                </form>
            </div>

            {/* Listado de Resultados */}
            <div>
                <h3>Lista de Vacunas en el Sistema</h3>
                {vacunas.length === 0 ? (
                    <p>No hay vacunas en el sistema.</p>
                ) : (
                    <ul>
                        {vacunas.map((v) => (
                            <li key={v.id_vacuna} style={{ marginBottom: '5px' }}>
                                <strong>ID:</strong> {v.id_vacuna} | <strong>Nombre:</strong> {v.nombre_vacuna} | <strong>Stock:</strong> {v.stock_disponible} unidades
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default FormularioVacuna
