import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import CampoTextoInput from './components/CampoTextoInput'
import ModalMensaje from './components/ModalMensaje'

function ValidacionRutPersonal() {
    //almacenamiento del estado de datos
    //validacion personal
    const [rut_personal, setRutPersonal] = useState('')
    const [modalInfo, setModalInfo] = useState({ show: false, mensaje: '', esError: false })
    const navigate = useNavigate()

    const handleRutChange = (rawValue) => {
        if (rawValue === '') {
            setRutPersonal('');
            return;
        }

        const cleanRut = rawValue.replace(/[^0-9kK]/g, '').toUpperCase();
        
        // Límite de 9 caracteres para el RUT (cuerpo + DV)
        if (cleanRut.length > 9) {
            return;
        }

        if (cleanRut.length === 0) {
            setRutPersonal('');
            return;
        }

        if (cleanRut.length === 1) {
            setRutPersonal(cleanRut);
            return;
        }

        const body = cleanRut.slice(0, -1);
        const dv = cleanRut.slice(-1);
        const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        setRutPersonal(`${formattedBody}-${dv}`);
    };

    //funcion para validar el rut ingresado
    const handleValidar = (e) => {
        e.preventDefault()

        // Removemos los puntos del RUT antes de enviarlo
        const rutSinPuntos = rut_personal.replace(/\./g, '');

        // realizamos la peticion POST para validar el rut del personal de la salud
        axios.post('http://127.0.0.1:8000/api/validar_personal/', { rut: rutSinPuntos })
            .then(response => {
                if (response.data.existe) {
                    // si el rut existe, se redirige al formulario de vacunacion
                    // enviando el centro de vacunacion correspondiente
                    navigate('/formulario/vacunacion/registro', {
                        state: {
                            centro_vacunacion: response.data.centro_vacunacion
                        }
                    })
                } else {
                    setModalInfo({ show: true, mensaje: 'El RUT ingresado no corresponde a personal de la salud. Intente nuevamente.', esError: true })
                }
            })
            .catch(error => {
                setModalInfo({ show: true, mensaje: 'El RUT ingresado no corresponde a personal de la salud. Intente nuevamente.', esError: true })
                console.error('Error al validar el RUT:', error)
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

                <h2>Validación de Personal de la Salud</h2>

                {/* formulario de validacion del rut de personal */}
                <div>
                    <p className="subtitle">Ingrese su RUT para continuar</p>
                    <form onSubmit={handleValidar}>
                        {/* componente CampoTexto */}
                        <CampoTextoInput
                            mensaje="RUT Personal"
                            tipo_dato="text"
                            ejemplo="Ej. 11.111.111-1"
                            valor_almacenado={rut_personal}
                            onChange={handleRutChange}
                        />
                        <button type="submit">Ingresar al Formulario</button>
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

export default ValidacionRutPersonal
