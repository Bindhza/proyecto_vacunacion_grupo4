import { Link } from 'react-router-dom'
import ButtonMenuPrincipal from './components/ButtonMenuPrincipal'

function MenuPrincipal() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1>Menú Principal</h1>
      <p>Bienvenido al sistema de control de vacunación.</p>

      <ButtonMenuPrincipal 
        mensaje="Entrar al formulario de Vacuna"
        ruta="/formulario/vacuna"
      />

      <ButtonMenuPrincipal 
        mensaje="Entrar al formulario de Vacunacion"
        ruta="/formulario/vacunacion"
      />

      <ButtonMenuPrincipal 
        mensaje="Entrar al formulario de Centro de Vacunacion"
        ruta="/formulario/centro"
      />
    </div>
  )
}

export default MenuPrincipal
