import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function MisCitas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [citaACancelar, setCitaACancelar] = useState(null);
  const [mensajeOperacion, setMensajeOperacion] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc = Más prontas primero

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user && user.rut) {
      axios.get(`http://127.0.0.1:8000/api/paciente/${user.rut}/citas/`)
        .then(response => {
          setCitas(response.data.citas);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error al cargar citas:", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleCancelar = (cita) => {
    setCitaACancelar(cita);
  };

  const confirmarCancelacion = () => {
    if (!citaACancelar) return;
    
    axios.post('http://127.0.0.1:8000/api/cancelar/', { cita_id: citaACancelar.id })
      .then(res => {
        setCitas(citas.filter(c => c.id !== citaACancelar.id));
        setMensajeOperacion('Cita cancelada exitosamente.');
        setCitaACancelar(null);
        setTimeout(() => setMensajeOperacion(''), 3000);
      })
      .catch(err => {
        console.error('Error al cancelar:', err);
        setMensajeOperacion('error: Ocurrió un error al cancelar la cita.');
        setCitaACancelar(null);
        setTimeout(() => setMensajeOperacion(''), 3000);
      });
  };

  if (loading) return <p style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Cargando citas...</p>;

  return (
    <div className="bpmn-interface-root">
      <div className="glass-container" style={{ maxWidth: '800px' }}>
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
              ← Volver
            </button>
          </Link>
        </div>

        <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>Mis Horas Agendadas</h2>
        
        {mensajeOperacion && (
          <div style={{ background: mensajeOperacion.includes('error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: mensajeOperacion.includes('error') ? '#ef4444' : '#10b981', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${mensajeOperacion.includes('error') ? '#ef4444' : '#10b981'}` }}>
            {mensajeOperacion}
          </div>
        )}
        
        {citas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'left' }}>No tienes citas agendadas.</p>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(15, 23, 42, 0.8)', color: 'white', cursor: 'pointer' }}
              >
                <option value="asc">🕒 Ordenar: Más prontas primero</option>
                <option value="desc">🕒 Ordenar: Más lejanas primero</option>
              </select>
            </div>
            {[...citas].sort((a, b) => {
              const dateA = new Date(`${a.fecha}T${a.hora}`);
              const dateB = new Date(`${b.fecha}T${b.hora}`);
              return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }).map((c) => (
              <div key={c.id} className="list-item" style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>{c.campana}</h3>
                  <p style={{ margin: '5px 0', color: 'var(--primary)' }}><strong>{c.fecha} a las {c.hora}</strong></p>
                  <p style={{ margin: '5px 0', color: 'var(--text-muted)' }}>{c.centro}</p>
                  <p style={{ margin: '5px 0', fontSize: '0.85rem' }}>{c.direccion}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link to="/" state={{ citaACancelarAlReagendar: c.id, campana_id: c.campana_id, centro_id: c.centro_id }}>
                    <button style={{ padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid var(--primary)', borderRadius: '8px', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                      Reagendar
                    </button>
                  </Link>
                  <button 
                    onClick={() => handleCancelar(c)} 
                    style={{ padding: '8px 12px', backgroundColor: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {citaACancelar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-container" style={{ padding: '30px', maxWidth: '400px', width: '90%', textAlign: 'center', background: 'rgba(15, 23, 42, 0.95)' }}>
            <h3 style={{ marginBottom: '15px' }}>¿Cancelar Cita?</h3>
            <p style={{ marginBottom: '25px', color: 'var(--text-muted)' }}>¿Estás seguro de que deseas cancelar tu cita para la campaña <strong>{citaACancelar.campana}</strong>?</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button onClick={() => setCitaACancelar(null)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '10px 20px' }}>Volver</button>
              <button onClick={confirmarCancelacion} style={{ background: '#ef4444', border: 'none', padding: '10px 20px' }}>Sí, Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MisCitas;
