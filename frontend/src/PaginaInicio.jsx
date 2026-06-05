import { Link } from 'react-router-dom'

function PaginaInicio() {
  return (
    <div className="bpmn-interface-root">
      <div className="glass-container" style={{ textAlign: 'center', width: '90%', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Sistema de Vacunación</h1>
        <p className="subtitle" style={{ fontSize: '1.1rem', marginBottom: '40px' }}>
          Seleccione el módulo que desea utilizar para continuar
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Link to="/sistema" style={{ textDecoration: 'none' }}>
            <button style={{ 
              padding: '18px', 
              borderRadius: '16px', 
              fontSize: '1.1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px' 
            }}>
              <span>📁</span>
              <span>Módulo de Administración (Interfaz 1)</span>
            </button>
          </Link>

          <Link to="/agendamiento" style={{ textDecoration: 'none' }}>
            <button style={{ 
              padding: '18px', 
              borderRadius: '16px', 
              fontSize: '1.1rem', 
              backgroundColor: '#10b981', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px' 
            }}>
              <span>📅</span>
              <span>Agendamiento de Citas (Interfaz 2)</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaginaInicio
