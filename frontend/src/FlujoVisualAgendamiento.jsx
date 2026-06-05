import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

function FlujoVisualAgendamiento() {
  const [step, setStep] = useState(0); // 0: Login, 1: Campaña, 2: Centro, 3: Horario, 4: Success
  const [user, setUser] = useState(null);
  
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  
  const [campanas, setCampanas] = useState([]);
  const [selectedCampana, setSelectedCampana] = useState(null);
  
  const [centros, setCentros] = useState([]);
  const [selectedCentro, setSelectedCentro] = useState(null);
  
  const [citas, setCitas] = useState([]);
  const [selectedCita, setSelectedCita] = useState(null);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Credenciales constantes para pruebas cuando la base de datos está vacía
    if (rut === '11111111-1' && password === 'admin') {
      setUser({
        rut: '11111111-1',
        nombres: 'Usuario',
        apellidos: 'De Prueba',
        correo: 'prueba@test.com'
      });
      fetchCampanas('11111111-1');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.usuario);
        fetchCampanas();
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  const fetchCampanas = async (rutToCheck = null) => {
    const currentRut = rutToCheck || user?.rut;
    if (currentRut === '11111111-1') {
      setCampanas([
        { id: 1, nombre: 'Campaña Invierno 2026', descripcion: 'Vacunación contra la Influenza y COVID-19' },
        { id: 2, nombre: 'Vacunación Escolar', descripcion: 'Dosis de refuerzo para estudiantes' }
      ]);
      setStep(1);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/campanas/`);
      const data = await res.json();
      setCampanas(data);
      setStep(1);
    } catch (err) {
      setError('Error cargando campañas');
    }
  };

  const handleSelectCampana = async (campana) => {
    setSelectedCampana(campana);
    setLoading(true);
    
    if (user?.rut === '11111111-1') {
      setTimeout(() => {
        setCentros([
          { id: 1, nombre: 'Cesfam San Francisco', direccion: 'Av. Las Flores 123, Comuna Central' },
          { id: 2, nombre: 'Hospital Regional', direccion: 'Calle Esperanza 456, Región Norte' }
        ]);
        setStep(2);
        setLoading(false);
      }, 600); // Simulamos retraso de red
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/campanas/${campana.id}/centros/`);
      const data = await res.json();
      setCentros(data);
      setStep(2);
    } catch (err) {
      setError('Error cargando centros');
    }
    setLoading(false);
  };

  const handleSelectCentro = async (centro) => {
    setSelectedCentro(centro);
    setLoading(true);

    if (user?.rut === '11111111-1') {
      setTimeout(() => {
        setCitas([
          { id: 101, fecha: '2026-06-10', hora: '09:00' },
          { id: 102, fecha: '2026-06-10', hora: '10:30' },
          { id: 103, fecha: '2026-06-11', hora: '14:00' }
        ]);
        setStep(3);
        setLoading(false);
      }, 600);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/campanas/${selectedCampana.id}/centros/${centro.id}/citas/`);
      const data = await res.json();
      setCitas(data);
      setStep(3);
    } catch (err) {
      setError('Error cargando horarios');
    }
    setLoading(false);
  };

  const handleAgendar = async (cita) => {
    setSelectedCita(cita);
    setLoading(true);

    if (user?.rut === '11111111-1') {
      setTimeout(() => {
        setStep(4);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/agendar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cita_id: cita.id, rut_paciente: user.rut })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(4);
      } else {
        setError(data.error || 'Error al agendar');
      }
    } catch (err) {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  return (
    <div className="bpmn-interface-root">
      <div className="glass-container">
        {/* Botón para volver a la página de inicio */}
        <div style={{ textAlign: 'left', marginBottom: '15px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button style={{ 
              background: 'transparent', 
              border: '1px solid var(--glass-border)', 
              color: 'var(--text-muted)', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '0.9rem',
              width: 'auto',
              marginTop: 0,
              display: 'inline-block'
            }}>
              ← Página de Inicio
            </button>
          </Link>
        </div>

        {step === 0 && (
          <form onSubmit={handleLogin}>
            <h2>Bienvenido</h2>
            <p className="subtitle">Inicia sesión para agendar tu hora</p>
            <div className="form-group">
              <label>RUT</label>
              <input type="text" value={rut} onChange={(e) => setRut(e.target.value)} placeholder="Ej: 12345678-9" required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Cargando...' : 'Ingresar'}
            </button>
          </form>
        )}

        {step === 1 && (
          <div>
            <h2>Selecciona una Campaña</h2>
            <p className="subtitle">Hola {user?.nombres}, ¿Para qué campaña deseas agendar?</p>
            {campanas.length === 0 ? <p style={{textAlign: 'center'}}>No hay campañas vigentes en este momento.</p> : null}
            {campanas.map(c => (
              <div key={c.id} className="list-item" onClick={() => handleSelectCampana(c)}>
                <h3>{c.nombre}</h3>
                <p>{c.descripcion}</p>
              </div>
            ))}
            {error && <p className="error-message">{error}</p>}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>Centros Disponibles</h2>
            <p className="subtitle">Selecciona el centro de vacunación</p>
            {centros.length === 0 ? <p style={{textAlign: 'center'}}>No hay centros con cupos disponibles para esta campaña.</p> : null}
            {centros.map(c => (
              <div key={c.id} className="list-item" onClick={() => handleSelectCentro(c)}>
                <h3>{c.nombre}</h3>
                <p>{c.direccion}</p>
              </div>
            ))}
            <button onClick={() => setStep(1)} style={{background: 'transparent', border: '1px solid var(--glass-border)'}}>Volver a Campañas</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2>Horarios Disponibles</h2>
            <p className="subtitle">Selecciona tu hora preferida en {selectedCentro?.nombre}</p>
            {citas.length === 0 ? <p style={{textAlign: 'center'}}>No hay horarios disponibles.</p> : null}
            {citas.map(c => (
              <div key={c.id} className="list-item" onClick={() => handleAgendar(c)}>
                <h3>{c.fecha}</h3>
                <p>Hora: {c.hora}</p>
              </div>
            ))}
            <button onClick={() => setStep(2)} style={{background: 'transparent', border: '1px solid var(--glass-border)'}}>Volver a Centros</button>
            {error && <p className="error-message">{error}</p>}
          </div>
        )}

        {step === 4 && (
          <div className="success-message">
            <svg style={{width:'80px', height:'80px', margin:'0 auto', display:'block', color:'var(--accent)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2>¡Cita Agendada!</h2>
            <p>Tu cita ha sido confirmada exitosamente.</p>
            <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginTop: '20px', textAlign: 'left'}}>
              <p><strong>Campaña:</strong> {selectedCampana?.nombre}</p>
              <p><strong>Centro:</strong> {selectedCentro?.nombre}</p>
              <p><strong>Fecha y Hora:</strong> {selectedCita?.fecha} a las {selectedCita?.hora}</p>
            </div>
            <button onClick={() => setStep(1)} style={{marginTop: '30px'}}>Agendar otra cita</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FlujoVisualAgendamiento;
