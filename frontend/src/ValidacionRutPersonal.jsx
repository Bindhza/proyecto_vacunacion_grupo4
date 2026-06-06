import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import CampoTextoInput from './components/CampoTextoInput'

function ValidacionRutPersonal() {
    //almacenamiento del estado de datos
    //validacion personal
    const [rut_personal, setRutPersonal] = useState('')
    const navigate = useNavigate()

    //funcion para validar el rut ingresado
    const handleValidar = (e) => {
        e.preventDefault()

        // realizamos la peticion POST para validar el rut del personal de la salud
        axios.post('http://127.0.0.1:8000/api/validar_personal/', { rut: rut_personal })
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
                    alert('El RUT ingresado no corresponde a personal de la salud. Intente nuevamente.')
                }
            })
            .catch(error => {
                alert('El RUT ingresado no corresponde a personal de la salud. Intente nuevamente.')
                console.error('Error al validar el RUT:', error)
            })
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>

            {/* Botón para volver al menú principal */}
            <Link to="/">
                <button style={{ backgroundColor: '#6c757d', marginBottom: '20px', cursor: 'pointer' }}>
                    ← Volver
                </button>
            </Link>

            <h1>Validación de Personal de la Salud</h1>

            {/* formulario de validacion del rut de personal */}
            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
                <h3>Ingrese su RUT para continuar</h3>
                <form onSubmit={handleValidar}>
                    {/* componente CampoTexto */}
                    <CampoTextoInput
                        mensaje="RUT Personal"
                        tipo_dato="text"
                        ejemplo="Ej. 12345678-9"
                        valor_almacenado={rut_personal}
                        onChange={(val) => setRutPersonal(val)}
                    />
                    <button type="submit" style={{ cursor: 'pointer' }}>Ingresar al Formulario</button>
                </form>
            </div>
        </div>
    )
}

export default ValidacionRutPersonal
