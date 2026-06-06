import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ButtonMenuPrincipal from './components/ButtonMenuPrincipal'

function MenuPrincipal() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      // Si no hay usuario, redirigir al login
      navigate('/')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  if (!user) return <div>Cargando...</div>

  const rol = user.rol

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      
      {/* Botón para cerrar sesión */}
      <button 
        onClick={handleLogout} 
        style={{ backgroundColor: '#dc3545', color: 'white', marginBottom: '20px', cursor: 'pointer', padding: '10px 20px', borderRadius: '8px', border: 'none' }}
      >
        ← Cerrar Sesión
      </button>

      <h1>Menú Principal</h1>
      <p>Bienvenido, {user.nombres} {user.apellidos} ({rol})</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', marginTop: '30px' }}>
        
        {/* Paciente puede ver solo agendar cita */}
        {/* Personal puede ver agendar cita y formulario de vacunacion */}
        {/* Admin puede ver formulario de vacunas y centro de vacunacion */}

        {(rol === 'Paciente' || rol === 'Personal') && (
          <ButtonMenuPrincipal 
            mensaje="Agendar Cita"
            ruta="/agendamiento"
          />
        )}

        {rol === 'Personal' && (
          <ButtonMenuPrincipal 
            mensaje="Entrar al formulario de Vacunacion"
            ruta="/formulario/vacunacion"
          />
        )}

        {rol === 'Admin' && (
          <>
            <ButtonMenuPrincipal 
              mensaje="Entrar al formulario de Vacunas"
              ruta="/formulario/vacuna"
            />
            <ButtonMenuPrincipal 
              mensaje="Entrar al formulario de Centro de Vacunacion"
              ruta="/formulario/centro"
            />
          </>
        )}
      </div>
    </div>
  )
}

export default MenuPrincipal
