import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import CampoTextoInput from './components/CampoTextoInput'
import CampoTextoOptions from './components/CampoTextoOptions'

function FormularioVacunacion() {
    //almacenamiento del estado de datos
    //vacunacion

    //se obtiene el usuario logueado del localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const rut_personal = storedUser ? storedUser.rut : '';

    const [id_vacunacion, setIdVacunacion] = useState('')
    const [fecha_vacunacion, setFechaVacunacion] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const [vacunas, setVacunas] = useState([])
    const [vacuna_aplicada, setVacunaAplicada] = useState('')

    const [centro_vacunacion, setCentroVacunacion] = useState('')
    //el centro se extrae del funcionario que lo vacuna que despues sera entregado
    //de momento dejar asi

    const [id_campania, setIdCampaña] = useState('')
    //la campaña se extrae de la vacuna

    //usuario_recibio_vacuna
    const [rut_vacunado, setRutVacunado] = useState('')

    const handleRutChange = (rawValue) => {
        if (rawValue === '') {
            setRutVacunado('');
            return;
        }
        const cleanRut = rawValue.replace(/[^0-9kK]/g, '').toUpperCase();
        
        // Límite de 9 caracteres para el RUT (cuerpo + DV)
        if (cleanRut.length > 9) {
            return;
        }
        
        if (cleanRut.length === 0) {
            setRutVacunado('');
            return;
        }
        if (cleanRut.length === 1) {
            setRutVacunado(cleanRut);
            return;
        }
        const body = cleanRut.slice(0, -1);
        const dv = cleanRut.slice(-1);
        const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        setRutVacunado(`${formattedBody}-${dv}`);
    };

    //sincronizamos la campaña con la vacuna seleccionada
    useEffect(() => {
        setIdCampaña(vacuna_aplicada)
    }, [vacuna_aplicada])

    // Autovalidar el centro del personal logueado
    useEffect(() => {
        if (rut_personal) {
            axios.post('http://127.0.0.1:8000/api/validar_personal/', { rut: rut_personal })
                .then(response => {
                    if (response.data.existe) {
                        setCentroVacunacion(response.data.centro_vacunacion);
                    }
                })
                .catch(error => {
                    console.error('Error al validar el centro del personal:', error);
                });
        }
    }, [rut_personal])

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
            id_usuario: rut_vacunado.replace(/\./g, ''),
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

                <h2>Gestión de Vacunación</h2>

                {/* formulario de registro de vacunacion de usuarios */}
                <div>
                    <p className="subtitle">Registrar Vacunación</p>
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
                            ejemplo="Ej. 11.111.111-1"
                            valor_almacenado={rut_vacunado}
                            onChange={handleRutChange}
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
                        <div className="form-group">
                            <label>Observaciones: </label>
                            <textarea
                                placeholder="Ej. Sin observaciones"
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '100px',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(15, 23, 42, 0.5)',
                                    color: 'white',
                                    fontFamily: "'Outfit', sans-serif",
                                    outline: 'none',
                                    resize: 'vertical',
                                    boxSizing: 'border-box'
                                }}

                            />
                        </div>
                        <button type="submit">Guardar Usuario Vacunado</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default FormularioVacunacion
