import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MenuPrincipal from './MenuPrincipal'
import FormularioVacuna from './FormularioVacunas'
import FormularioVacunacion from './FormularioVacunacion'
import FormularioCentro from './FomularioCentro'

function App() {
  return (
    <Router>
      <Routes>
        {/* ruta del menú principal */}
        <Route path="/" element={<MenuPrincipal />} />

        {/* ruta del formulario para agregar una vacuna */}
        <Route path="/formulario/vacuna" element={<FormularioVacuna />} />

        {/* ruta del formulario para agregar a una persona vacunada */}
        <Route path="/formulario/vacunacion" element={<FormularioVacunacion />} />

        {/* ruta del formulario para agregar un centro */}
        <Route path="/formulario/centro" element={<FormularioCentro />} />
      </Routes>
    </Router>
  )
}

export default App
