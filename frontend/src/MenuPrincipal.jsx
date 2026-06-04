import { Link } from 'react-router-dom'

function MenuPrincipal() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1>Menú Principal</h1>
      <p>Bienvenido al sistema de control de vacunación.</p>

      {/* bloque del primer boton*/}
      <div style={{ marginBottom: '15px' }}>
        {/* para evitar que se recargue la página y hace que el boton redireccione al formulario de vacunas*/}
        <Link to="/formulario/vacuna">
          <button style={{ fontSize: '18px', padding: '12px 24px', cursor: 'pointer' }}>
            Entrar al formulario de Vacunas
          </button>
        </Link>
      </div>
      {/* bloque del segundo boton */}
      <div>
        <Link to="/formulario/vacunacion">
          <button style={{ fontSize: '18px', padding: '12px 24px', cursor: 'pointer' }}>
            Entrar al formulario de Vacunacion
          </button>
        </Link>
      </div>
    </div>
  )
}

export default MenuPrincipal
