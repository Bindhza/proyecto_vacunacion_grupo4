import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import CampoTextoInput from './components/CampoTextoInput'
import CampoTextoOptions from './components/CampoTextoOptions'

function FormularioVacunacion() {
    //almacenamiento del estado de datos
    //vacunacion

    //se obtiene el centro de vacunacion desde el formulario de validacion
    const location = useLocation()
    const centro_inicial = location.state?.centro_vacunacion || ''

    const [id_vacunacion, setIdVacunacion] = useState('')
    const [fecha_vacunacion, setFechaVacunacion] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const [vacunas, setVacunas] = useState([])
    const [vacuna_aplicada, setVacunaAplicada] = useState('')

    const [centro_vacunacion, setCentroVacunacion] = useState(centro_inicial)
    //el centro se extrae del funcionario que lo vacuna que despues sera entregado
    //de momento dejar asi

    const [id_campania, setIdCampaña] = useState('')
    //la campaña se extrae de la vacuna

    //usuario_recibio_vacuna
    const [rut_vacunado, setRutVacunado] = useState('')

    //sincronizamos la campaña con la vacuna seleccionada
    useEffect(() => {
        setIdCampaña(vacuna_aplicada)
    }, [vacuna_aplicada])


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
            id_usuario: rut_vacunado,
            centro_vacunacion: centro_vacunacion ? parseInt(centro_vacunacion) : null, // se aplicará después
            id_campaña: id_campania ? parseInt(id_campania) : null
        }

        //peticion POST para guardar la vacunacion realizada
        axios.post('http://127.0.0.1:8000/api/enviar_formulario/', nuevaVacunacion)
            .then(() => {
                // se limpia el formulario para rellenar nuevos datos
                setRutVacunado('')
                setFechaVacunacion('')
                setVacunaAplicada('')
                setObservaciones('')
                setIdVacunacion('')
                alert('Registro de vacunación guardado exitosamente.')
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
                    {/* componente CampoTexto */}
                    <CampoTextoInput
                        mensaje="ID Vacunacion"
                        tipo_dato="text"
                        ejemplo="Ej. 1"
                        valor_almacenado={id_vacunacion}
                        onChange={(val) => setIdVacunacion(val)}
                    />
                    <CampoTextoInput
                        mensaje="Rut Vacunado"
                        tipo_dato="text"
                        ejemplo="Ej. 12345678-9"
                        valor_almacenado={rut_vacunado}
                        onChange={(val) => setRutVacunado(val)}
                    />
                    <CampoTextoInput
                        mensaje="Fecha Vacunacion: "
                        tipo_dato="date"
                        ejemplo="Ej. 2022-01-01"
                        valor_almacenado={fecha_vacunacion}
                        onChange={(val) => setFechaVacunacion(val)}
                    />

                    {/*componente CampoTextoOptions para seleccionar la vacuna a aplicar*/}
                    <CampoTextoOptions
                        mensaje="Vacuna Aplicada: "
                        data_type={vacunas}
                        default_value="-- Seleccione Vacuna --"
                        valor_almacenado={vacuna_aplicada}
                        onChange={(val) => setVacunaAplicada(val)}
                    />

                    {/*campo de texto para observaciones*/}
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
