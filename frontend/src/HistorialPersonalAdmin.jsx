import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CampoTextoOptions from './components/CampoTextoOptions';

function HistorialPersonalAdmin() {
  const [personalList, setPersonalList] = useState([]);
  const [selectedRut, setSelectedRut] = useState('');
  const [historialAplicadas, setHistorialAplicadas] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [error, setError] = useState('');

  // Cargar la lista de personal
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/personal/')
      .then(response => {
        setPersonalList(response.data);
      })
      .catch(err => {
        console.error("Error al cargar personal:", err);
        setError("No se pudo cargar la lista de personal.");
      });
  }, []);

  // Cargar el historial del personal seleccionado
  useEffect(() => {
    if (selectedRut) {
      setLoadingHistorial(true);
      setError('');
      axios.get(`http://127.0.0.1:8000/api/paciente/${selectedRut}/citas/`)
        .then(response => {
          setHistorialAplicadas(response.data.historial_aplicadas || []);
          setLoadingHistorial(false);
        })
        .catch(err => {
          console.error("Error al cargar historial del personal:", err);
          setError("No se pudo cargar el historial del personal seleccionado.");
          setHistorialAplicadas([]);
          setLoadingHistorial(false);
        });
    } else {
      setHistorialAplicadas([]);
    }
  }, [selectedRut]);

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

        <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>Historial por Personal</h2>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ef4444' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '30px' }}>
          <CampoTextoOptions 
            mensaje="Seleccionar Personal:"
            data_type={personalList.map(p => ({ id: p.rut, nombre: `${p.nombres} ${p.apellidos} (${p.rut})` }))}
            default_value="-- Seleccione Personal --"
            valor_almacenado={selectedRut}
            onChange={(val) => setSelectedRut(val)}
          />
        </div>

        {selectedRut && (
          <div style={{ marginTop: '30px' }}>
            <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>Vacunas Aplicadas</h2>
            {loadingHistorial ? (
              <p style={{ color: 'var(--text-muted)' }}>Cargando historial...</p>
            ) : historialAplicadas.length > 0 ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {historialAplicadas.map(h => (
                  <div key={h.id} style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid #8b5cf6', textAlign: 'left' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>Aplicado a: {h.paciente_nombre} ({h.paciente_rut})</p>
                    <p style={{ margin: '5px 0', color: 'var(--text-muted)' }}><strong>Campaña:</strong> {h.campana} - Dosis {h.dosis}</p>
                    <p style={{ margin: '5px 0', color: 'var(--text-muted)' }}><strong>Fecha:</strong> {h.fecha} a las {h.hora}</p>
                    <p style={{ margin: '5px 0', color: 'var(--text-muted)' }}><strong>Centro:</strong> {h.centro}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'left', color: 'var(--text-muted)' }}>Este personal no ha registrado vacunas aún.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistorialPersonalAdmin;
