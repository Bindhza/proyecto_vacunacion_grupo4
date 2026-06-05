import { Link } from 'react-router-dom'
import ButtonMenuPrincipal from './components/ButtonMenuPrincipal'

function MenuPrincipal() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1>Menú Principal</h1>
      <p>Bienvenido al sistema de control de vacunación.</p>

      {/*boton para entrar al formulario de vacuna */}
      {/*estara disponible para admin o doctores*/}
      <ButtonMenuPrincipal 
        mensaje="Entrar al formulario de Vacuna"
        ruta="/formulario/vacuna"
      />

      {/*boton para entrar al formulario de vacunacion */}
      {/*estara disponible para personal de la salud*/}
      <ButtonMenuPrincipal 
        mensaje="Entrar al formulario de Vacunacion"
        ruta="/formulario/vacunacion"
      />

      {/*boton para entrar al formulario de centro de vacunacion */}
      {/*estara disponible para admin*/}
      <ButtonMenuPrincipal 
        mensaje="Entrar al formulario de Centro de Vacunacion"
        ruta="/formulario/centro"
      />
    </div>
  )
}

export default MenuPrincipal
