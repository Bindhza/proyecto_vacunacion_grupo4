import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MenuPrincipal from './MenuPrincipal'
import FormularioVacuna from './FormularioVacunas'
import FormularioVacunacion from './FormularioVacunacion'
import FormularioCentro from './FomularioCentro'
import ValidacionRutPersonal from './ValidacionRutPersonal'

function App() {
  return (
    <Router>
      <Routes>
        {/* ruta del menú principal */}
        <Route path="/" element={<MenuPrincipal />} />

        {/* ruta del formulario para agregar una vacuna */}
        <Route path="/formulario/vacuna" element={<FormularioVacuna />} />

        {/* ruta de la validación del rut del personal de la salud */}
        <Route path="/formulario/vacunacion" element={<ValidacionRutPersonal />} />

        {/* ruta del formulario para registrar la vacunacion */}
        <Route path="/formulario/vacunacion/registro" element={<FormularioVacunacion />} />

        {/* ruta del formulario para agregar un centro */}
        <Route path="/formulario/centro" element={<FormularioCentro />} />
      </Routes>
    </Router>
  )
}

export default App
