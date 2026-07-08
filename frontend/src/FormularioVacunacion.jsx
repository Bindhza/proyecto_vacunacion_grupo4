import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import CampoTextoInput from './components/CampoTextoInput'
import CampoTextoOptions from './components/CampoTextoOptions'
import ModalMensaje from './components/ModalMensaje'

function FormularioVacunacion() {
    //almacenamiento del estado de datos
    //vacunacion

    //se obtiene el usuario logueado del localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const rut_personal = storedUser ? storedUser.rut : '';

    const [id_vacunacion, setIdVacunacion] = useState('')
    const [fecha_vacunacion, setFechaVacunacion] = useState('')
    const [hora_vacunacion, setHoraVacunacion] = useState('')
    const [observaciones, setObservaciones] = useState('')
    
    const [campanas, setCampanas] = useState([])
    const [campana_aplicada, setCampanaAplicada] = useState('')

    const [centros, setCentros] = useState([])
    const [centro_vacunacion, setCentroVacunacion] = useState('')

    //usuario_recibio_vacuna
    const [rut_vacunado, setRutVacunado] = useState('')

    const [modalInfo, setModalInfo] = useState({ show: false, mensaje: '', esError: false });

    const getTodayYMD = () => {
        const dateObj = new Date();
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };
    const today = getTodayYMD();

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

    //sincronizamos centros al seleccionar la campaña
    useEffect(() => {
        if (campana_aplicada) {
            axios.get(`http://127.0.0.1:8000/api/campanas/${campana_aplicada}/centros/`)
                .then(response => {
                    setCentros(response.data)
                })
                .catch(error => {
                    console.error('Error al cargar centros de la campaña:', error)
                })
        } else {
            setCentros([])
        }
    }, [campana_aplicada])

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

    //realizamos la peticion GET para obtener las campanas
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/campanas/')
            .then(response => {
                setCampanas(response.data) //pedimos todas las campañas disponibles para mostrar
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
            fecha_vacunacion: fecha_vacunacion,
            hora_vacunacion: hora_vacunacion,
            observaciones: observaciones,
            campana: parseInt(campana_aplicada),
            id_usuario: rut_vacunado.replace(/\./g, ''),
            centro_vacunacion: centro_vacunacion ? parseInt(centro_vacunacion) : null,
            rut_personal: rut_personal.replace(/\./g, '')
        }

        //peticion POST para guardar la vacunacion realizada
        axios.post('http://127.0.0.1:8000/api/enviar_formulario/', nuevaVacunacion)
            .then(() => {
                // se limpia el formulario para rellenar nuevos datos
                setRutVacunado('')
                setFechaVacunacion('')
                setHoraVacunacion('')
                setCampanaAplicada('')
                setObservaciones('')
                setIdVacunacion('')
                setModalInfo({ show: true, mensaje: 'Registro de vacunación guardado exitosamente.', esError: false })
            })
            .catch(error => {
                setModalInfo({ show: true, mensaje: 'Error al guardar el registro. Intenta nuevamente.', esError: true })
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
                            max={today}
                        />

                        <CampoTextoInput
                            mensaje="Hora Vacunacion: "
                            tipo_dato="time"
                            ejemplo="Ej. 10:30"
                            valor_almacenado={hora_vacunacion}
                            onChange={(val) => setHoraVacunacion(val)}
                        />

                        {/*componente CampoTextoOptions para seleccionar la campana*/}
                        <CampoTextoOptions
                            mensaje="Campaña: "
                            data_type={campanas.map(c => ({id: c.id, nombre: c.nombre}))}
                            default_value="-- Seleccione Campaña --"
                            valor_almacenado={campana_aplicada}
                            onChange={(val) => setCampanaAplicada(val)}
                        />

                        <CampoTextoOptions
                            mensaje="Centro de Vacunación: "
                            data_type={centros.map(c => ({id: c.id, nombre: c.nombre}))}
                            default_value="-- Seleccione Centro --"
                            valor_almacenado={centro_vacunacion}
                            onChange={(val) => setCentroVacunacion(val)}
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
            <ModalMensaje 
                show={modalInfo.show} 
                mensaje={modalInfo.mensaje} 
                esError={modalInfo.esError} 
                onClose={() => setModalInfo({ show: false, mensaje: '', esError: false })} 
            />
        </div>
    )
}

export default FormularioVacunacion
