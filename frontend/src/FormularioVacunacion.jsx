import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function FormularioVacunacion() {
    //almacenamiento del estado de datos
    //vacunacion

    const [id_vacunacion, setVacunacion] = useState('')
    const [fecha_vacunacion, setFechaVacunacion] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const [vacunas, setVacunas] = useState([])
    const [vacuna_aplicada, setVacunaAplicada] = useState('')
    //const [centro, setCentros] = useState([])
    //el centro se extrae del funcionario que lo vacuna

    //const [campañas, setCampaña] = useState([])
    //la campaña se puede extraer de la vacuna


    //usuario_recibio_vacuna
    const [rut_vacunado, setRutVacunado] = useState('')

    //campaña
    const [id_campania, setIdCampaña] = useState('')


    //realizamos la peticion GET para obtener las vacunas
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/vacunas/')
            .then(response => {
                setVacunas(response.data) //pedimos todas las vacunas disponibles para mostrar
            })
            .catch(error => {
                console.error('Error al cargar datos:', error)
            })
    }, [])

    // 3. Petición POST al enviar el formulario para crear una vacuna
    const handleSubmit = (e) => {
        e.preventDefault()

        // se prepara la subida de la nueva vacunacion
        const nuevaVacunacion = {
            id_vacunacion: parseInt(id_vacunacion),
            fecha_vacunacion: fecha_vacunacion,
            observaciones: observaciones,
            vacuna_aplicada: parseInt(vacuna_aplicada),
            //centro_vacunacion: centro_vacunacion, se aplicara despues
            usuario_recibio_vacuna: usuario_recibio_vacuna,
            //id_campania: id_campania  se agregara despues
        }

        //peticion POST para guardar la vacunacion realizada
        axios.post('http://127.0.0.1:8000/api/vacunacion/', nuevaVacunacion)
            .then(response => {
                // obtenemos el id de la vacunacion realizada
                const asociacionPaciente = {
                    rut_vacunado: rut_vacunado,
                    id_vacunacion: parseInt(id_vacunacion),
                }
                //guardamos la asociacion entre el usuario y la vacuna
                return axios.post('http://127.0.0.1:8000/api/usuario_recibio_vacuna/', asociacionPaciente)
            })
            // se limpia el formulario para rellenar nuevos datos
            .then(() => {
                setRutVacunado('')
                setFechaVacunacion('')
                setVacunaAplicada('')
                setObservaciones('')
                setIdVacunacion('')
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

            <h1>Gestión de Vacunacion</h1>

            {/* formulario de registro de vacunacion de usuarios */}
            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
                <h3>Registrar Vacunacion</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <label>ID Vacunacion: </label>
                        <input
                            type="text"
                            placeholder="Ej. 1"
                            value={id_vacunacion}
                            onChange={(e) => setIdVacunacion(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Rut Vacunado: </label>
                        <input
                            type="text"
                            placeholder="Ej. 12345678-9"
                            value={rut_vacunado}
                            onChange={(e) => setRutVacunado(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Fecha Vacunacion: </label>
                        <input
                            type="date"
                            placeholder="Ej. 2022-01-01"
                            value={fecha_vacunacion}
                            onChange={(e) => setFechaVacunacion(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label> Vacuna Aplicada: </label>
                        {/*select permite mostrar una lista de opciones para que el usuario seleccione una*/}
                        {/*value setea el valor seleccionado*/}
                        <select
                            value={vacuna_aplicada}
                            onChange={(e) => setVacunaAplicada(e.target.value)}
                            required
                        >
                            {/*opcion predeterminada*/}
                            <option value="">-- Seleccione Vacuna --</option>

                            {/*se recore y agrega cada vacuna como una opcion */}
                            {vacunas.map((vacuna) => (
                                <option key={vacuna.id_vacuna} value={vacuna.id_vacuna}>
                                    {vacuna.nombre_vacuna} (Stock: {vacuna.stock_disponible})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            verticalAlign: 'top'
                        }}>

                            Observaciones: </label>
                        <textarea
                            type="text"
                            placeholder="Ej. Sin observaciones"
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            style={{
                                width: '80%',
                                height: '100px',
                                padding: '10px',
                                resize: 'vertical',
                                boxSizing: 'border-box'
                            }}

                        />
                    </div>
                    <button type="submit">Guardar Usuario Vacunado</button>
                </form>
            </div>
        </div>
    )
}

export default FormularioVacunacion
