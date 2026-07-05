import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

function FlujoVisualAgendamiento() {
  const [step, setStep] = useState(0); // 0: Login, 1: Campaña, 2: Centro, 3: Horario, 4: Success
  const [user, setUser] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const location = useLocation();
  const reagendarData = location.state;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setStep(1); 
      
      fetch(`${API_BASE}/campanas/`)
        .then(res => res.json())
        .then(data => {
          setCampanas(data);
          
          if (reagendarData && reagendarData.campana_id) {
            const campanaAutoseleccionada = data.find(c => c.id === reagendarData.campana_id);
            if (campanaAutoseleccionada) {
              handleSelectCampana(campanaAutoseleccionada);
            }
          }
        })
        .catch(err => console.error('Error cargando campañas', err));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setStep(0);
    setRut('');
    setPassword('');
    setMenuAbierto(false);
  };
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const [campanas, setCampanas] = useState([]);
  const [selectedCampana, setSelectedCampana] = useState(null);

  const [centros, setCentros] = useState([]);
  const [selectedCentro, setSelectedCentro] = useState(null);

  const [citas, setCitas] = useState([]);
  const [selectedCita, setSelectedCita] = useState(null);
  const [modalError, setModalError] = useState('');
  const [expandedDates, setExpandedDates] = useState({});

  const toggleDate = (fecha) => {
    setExpandedDates(prev => ({
      ...prev,
      [fecha]: !prev[fecha]
    }));
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRutChange = (e) => {
    const rawValue = e.target.value;
    if (rawValue === '') {
      setRut('');
      return;
    }
    const cleanRut = rawValue.replace(/[^0-9kK]/g, '').toUpperCase();

    // Límite de 9 caracteres para el RUT (cuerpo + DV)
    if (cleanRut.length > 9) {
      return;
    }

    if (cleanRut.length === 0) {
      setRut('');
      return;
    }
    if (cleanRut.length === 1) {
      setRut(cleanRut);
      return;
    }
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setRut(`${formattedBody}-${dv}`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');


    try {
      const rutSinPuntos = rut.replace(/\./g, '');
      const res = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut: rutSinPuntos, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.usuario);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        fetchCampanas();
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  const fetchCampanas = async () => {
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

    try {
      const res = await fetch(`${API_BASE}/campanas/${campana.id}/centros/`);
      const data = await res.json();
      setCentros(data);

      if (reagendarData && reagendarData.centro_id) {
        const centroAutoseleccionado = data.find(c => c.id === reagendarData.centro_id);
        if (centroAutoseleccionado) {
          handleSelectCentro(centroAutoseleccionado, campana.id);
          return;
        }
      }
      setStep(2);
    } catch (err) {
      setError('Error cargando centros');
    }
    setLoading(false);
  };

  const handleSelectCentro = async (centro, campanaId = null) => {
    setSelectedCentro(centro);
    setLoading(true);
    const cId = campanaId || selectedCampana.id;

    try {
      const res = await fetch(`${API_BASE}/campanas/${cId}/centros/${centro.id}/citas/`);
      const data = await res.json();
      setCitas(data);
      setExpandedDates({}); // Asegura que todos los desplegables empiecen cerrados
      setStep(3);
    } catch (err) {
      setError('Error cargando horarios');
    }
    setLoading(false);
  };

  const handleAgendar = async () => {
    if (!selectedCita) return;
    setLoading(true);

    try {
      const payload = { cita_id: selectedCita.id, rut_paciente: user.rut };
      if (reagendarData && reagendarData.citaACancelarAlReagendar) {
        payload.cita_a_cancelar = reagendarData.citaACancelarAlReagendar;
      }

      const res = await fetch(`${API_BASE}/agendar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setStep(4);
      } else {
        setModalError(data.error || 'Ya tienes una hora agendada para este día o ocurrió un error.');
        setError('');
      }
    } catch (err) {
      setModalError('Error de conexión al intentar agendar.');
      setError('');
    }
    setLoading(false);
  };

  const citasValidas = citas.filter(c => {
    const citaDateTime = new Date(`${c.fecha}T${c.hora}`);
    const now = new Date();
    const hoursDiff = (citaDateTime - now) / (1000 * 60 * 60);
    return c.cupos > 0 && hoursDiff >= 2;
  });

  return (
    <div className="bpmn-interface-root">
      {/* Navegación superior si el usuario está logueado */}
      {step > 0 && user && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--glass-border)', zIndex: 10 }}>
            <div>
              <strong style={{ fontSize: '1.1rem', color: 'white' }}>VacunApp - Bienvenido, {user.nombres} ({user.rol || 'Paciente'})</strong>
            </div>
            <button
              onClick={toggleMenu}
              style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'white',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease',
                marginLeft: 'auto',
                marginTop: '0'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
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
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(10px)',
              borderLeft: '1px solid var(--glass-border)',
              boxShadow: '-2px 0 10px rgba(0,0,0,0.5)',
              transition: 'right 0.3s ease',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              boxSizing: 'border-box',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem' }}>Opciones</h2>
              <button
                onClick={toggleMenu}
                style={{
                  width: '35px',
                  height: '35px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  marginTop: 0
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
              <Link to="/perfil" style={{ textDecoration: 'none' }} onClick={toggleMenu}>
                <button style={{ width: '100%', padding: '12px 16px', backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'white' }}>Mi Perfil</button>
              </Link>
              <Link to="/historial" style={{ textDecoration: 'none' }} onClick={toggleMenu}>
                <button style={{ width: '100%', padding: '12px 16px', backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'white' }}>Historial</button>
              </Link>
              <Link to="/mis-citas" style={{ textDecoration: 'none' }} onClick={toggleMenu}>
                <button style={{ width: '100%', padding: '12px 16px', backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'white' }}>Mis Horas Agendadas</button>
              </Link>

              {user.rol === 'Personal' && (
                <Link to="/formulario/vacunacion" style={{ textDecoration: 'none' }} onClick={toggleMenu}>
                  <button style={{ width: '100%', padding: '12px 16px', backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'white' }}>Formulario de Vacunación</button>
                </Link>
              )}
              {user.rol === 'Admin' && (
                <>
                  <Link to="/formulario/campana" style={{ textDecoration: 'none' }} onClick={toggleMenu}>
                    <button style={{ width: '100%', padding: '12px 16px', backgroundColor: 'transparent', border: '1px solid #10b981', color: 'white' }}>Campañas</button>
                  </Link>
                  <Link to="/formulario/vacuna" style={{ textDecoration: 'none' }} onClick={toggleMenu}>
                    <button style={{ width: '100%', padding: '12px 16px', backgroundColor: 'transparent', border: '1px solid #8b5cf6', color: 'white' }}>Vacunas</button>
                  </Link>
                  <Link to="/formulario/centro" style={{ textDecoration: 'none' }} onClick={toggleMenu}>
                    <button style={{ width: '100%', padding: '12px 16px', backgroundColor: 'transparent', border: '1px solid var(--accent)', color: 'white' }}>Centro de Vacunación</button>
                  </Link>
                </>
              )}
            </div>

            <button onClick={handleLogout} style={{ width: '100%', padding: '12px 16px', backgroundColor: '#ef4444', border: 'none', color: 'white', fontWeight: 'bold', marginTop: 'auto', marginBottom: '20px' }}>
              Cerrar Sesión
            </button>
          </div>
        </>
      )}

      <div className="glass-container" style={{ marginTop: step > 0 ? '80px' : '0' }}>

        {step === 0 && (
          <form onSubmit={handleLogin}>
            <h2>Bienvenido</h2>
            <p className="subtitle">Inicia sesión para agendar tu hora</p>
            <div className="form-group">
              <label>RUT</label>
              <input type="text" value={rut} onChange={handleRutChange} placeholder="Ej: 11.111.111-1" required />
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
            <h2>{reagendarData ? 'Reagendando tu hora' : 'Selecciona una Campaña'}</h2>
            <p className="subtitle">
              {reagendarData
                ? `Hola ${user?.nombres}, selecciona el centro y el nuevo horario`
                : `Hola ${user?.nombres}, ¿Para qué campaña deseas agendar?`
              }
            </p>
            {campanas.length === 0 ? <p style={{ textAlign: 'center' }}>No hay campañas vigentes en este momento.</p> : null}
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
            {centros.length === 0 ? <p style={{ textAlign: 'center' }}>No hay centros con cupos disponibles para esta campaña.</p> : null}
            {centros.map(c => (
              <div key={c.id} className="list-item" onClick={() => handleSelectCentro(c)}>
                <h3>{c.nombre}</h3>
                <p>{c.direccion}</p>
              </div>
            ))}
            {!reagendarData && <button onClick={() => setStep(1)} style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>Volver a Campañas</button>}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2>Horarios Disponibles</h2>
            <p className="subtitle">Selecciona tu hora preferida en {selectedCentro?.nombre}</p>
            {citasValidas.length === 0 ? <p style={{ textAlign: 'center' }}>No hay horarios disponibles.</p> : null}

            {Object.entries(citasValidas.reduce((acc, c) => {
              if (!acc[c.fecha]) acc[c.fecha] = [];
              acc[c.fecha].push(c);
              return acc;
            }, {})).map(([fecha, citasDelDia]) => {
              const dateObj = new Date(fecha + "T00:00:00");
              const formattedDate = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
              return (
                <div key={fecha} style={{ marginBottom: '30px', textAlign: 'left', background: 'rgba(15, 23, 42, 0.5)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <h3
                    onClick={() => toggleDate(fecha)}
                    style={{ cursor: 'pointer', textTransform: 'capitalize', marginBottom: '15px', color: 'var(--text-main)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    {formattedDate}
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                      {expandedDates[fecha] ? '▲ Ocultar' : '▼ Ver Horarios'}
                    </span>
                  </h3>
                  {expandedDates[fecha] && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {citasDelDia.map(c => {
                        const isSelected = selectedCita && selectedCita.id === c.id;
                        const isAvailable = true; // ya fueron filtrados

                        let bg = isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)';
                        let borderCol = isAvailable ? '#10b981' : '#4b5563';
                        let textCol = isAvailable ? '#10b981' : '#9ca3af';

                        if (isSelected) {
                          bg = 'var(--primary)'; // Azul/Morado
                          borderCol = 'var(--primary)';
                          textCol = 'white';
                        }

                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              if (isAvailable) setSelectedCita(c);
                            }}
                            disabled={!isAvailable}
                            style={{
                              padding: '12px 5px',
                              borderRadius: '8px',
                              fontSize: '1rem',
                              fontWeight: 'bold',
                              cursor: isAvailable ? 'pointer' : 'not-allowed',
                              border: `2px solid ${borderCol}`,
                              transition: 'all 0.2s ease',
                              backgroundColor: bg,
                              color: textCol,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            {c.hora}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {selectedCita && (
              <button
                onClick={handleAgendar}
                style={{ width: '100%', padding: '15px', fontSize: '1.1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '15px', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' }}
              >
                Confirmar Hora: {selectedCita.fecha} a las {selectedCita.hora}
              </button>
            )}

            {!reagendarData && <button onClick={() => setStep(2)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', width: '100%' }}>Volver a Centros</button>}
            {error && <p className="error-message">{error}</p>}
          </div>
        )}

        {step === 4 && (
          <div className="success-message">
            <svg style={{ width: '80px', height: '80px', margin: '0 auto', display: 'block', color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2>¡Cita Agendada!</h2>
            <p>Tu cita ha sido confirmada exitosamente.</p>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginTop: '20px', textAlign: 'left' }}>
              <p><strong>Campaña:</strong> {selectedCampana?.nombre}</p>
              <p><strong>Centro:</strong> {selectedCentro?.nombre}</p>
              <p><strong>Fecha y Hora:</strong> {selectedCita?.fecha} a las {selectedCita?.hora}</p>
            </div>
            <button onClick={() => setStep(1)} style={{ marginTop: '30px' }}>Agendar otra cita</button>
          </div>
        )}
      </div>

      {modalError && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-container" style={{ padding: '30px', maxWidth: '400px', width: '90%', textAlign: 'center', background: 'rgba(15, 23, 42, 0.98)', border: '1px solid #ef4444', boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)' }}>
            <h3 style={{ marginBottom: '15px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Acción No Permitida
            </h3>
            <p style={{ marginBottom: '25px', color: 'white', fontSize: '1.1rem' }}>{modalError}</p>
            <button onClick={() => setModalError('')} style={{ background: '#ef4444', border: 'none', padding: '10px 30px', fontWeight: 'bold' }}>Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlujoVisualAgendamiento;
