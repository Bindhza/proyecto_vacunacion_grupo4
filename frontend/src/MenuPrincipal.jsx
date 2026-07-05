import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ButtonMenuPrincipal from './components/ButtonMenuPrincipal'

function MenuPrincipal() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(false)

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

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto)
  }

  if (!user) return <div>Cargando...</div>

  const rol = user.rol

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '15px 30px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #ddd'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Menú Principal</h1>
        <button 
          onClick={toggleMenu}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '30px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ☰
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '40px', textAlign: 'center', flex: 1 }}>
        <h2>Bienvenido, {user.nombres} {user.apellidos}</h2>
        <p style={{ color: '#666', fontSize: '18px' }}>Rol: {rol}</p>
        <p style={{ marginTop: '20px' }}>
          Selecciona una opción en el menú de la derecha para continuar.
        </p>
      </div>

      {/* Sidebar Overlay */}
      {menuAbierto && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={toggleMenu}
        />
      )}

      {/* Sidebar Drawer */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: menuAbierto ? 0 : '-350px',
          width: '300px',
          height: '100%',
          backgroundColor: 'white',
          boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
          transition: 'right 0.3s ease',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: 0 }}>Opciones</h2>
          <button 
            onClick={toggleMenu}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
          {(rol === 'Paciente' || rol === 'Personal') && (
            <ButtonMenuPrincipal 
              mensaje="Agendar Cita"
              ruta="/agendamiento"
            />
          )}

          {rol === 'Personal' && (
            <ButtonMenuPrincipal 
              mensaje="Formulario de Vacunación"
              ruta="/formulario/vacunacion"
            />
          )}

          {rol === 'Admin' && (
            <>
              <ButtonMenuPrincipal 
                mensaje="Formulario de Vacunas"
                ruta="/formulario/vacuna"
              />
              <ButtonMenuPrincipal 
                mensaje="Centro de Vacunación"
                ruta="/formulario/centro"
              />
            </>
          )}
        </div>

        <button 
          onClick={handleLogout} 
          style={{ 
            backgroundColor: '#dc3545', 
            color: 'white', 
            marginTop: 'auto', 
            cursor: 'pointer', 
            padding: '12px 20px', 
            borderRadius: '8px', 
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}

export default MenuPrincipal
