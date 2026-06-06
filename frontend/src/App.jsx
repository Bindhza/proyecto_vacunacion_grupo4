import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PaginaInicio from './PaginaInicio'
import MenuPrincipal from './MenuPrincipal'
import FormularioVacuna from './FormularioVacunas'
import FormularioVacunacion from './FormularioVacunacion'
import FormularioCentro from './FomularioCentro'

import FlujoVisualAgendamiento from './FlujoVisualAgendamiento'

function App() {
  return (
    <Router>
      <Routes>
        {/* ruta principal (Login integrado y Agendamiento) */}
        <Route path="/" element={<FlujoVisualAgendamiento />} />

        {/* ruta del formulario para agregar una vacuna */}
        <Route path="/formulario/vacuna" element={<FormularioVacuna />} />

        {/* ruta del formulario para registrar la vacunacion directamente */}
        <Route path="/formulario/vacunacion" element={<FormularioVacunacion />} />

        {/* ruta del formulario para agregar un centro */}
        <Route path="/formulario/centro" element={<FormularioCentro />} />
      </Routes>
    </Router>
  )
}

export default App
