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
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCampana, setFiltroCampana] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = más recientes

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
            
            {/* Filtros */}
            {historialAplicadas.length > 0 && (
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Buscar por nombre o RUT del paciente..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ flex: '1', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                />
                <select 
                  value={filtroCampana} 
                  onChange={(e) => setFiltroCampana(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(15, 23, 42, 0.8)', color: 'white' }}
                >
                  <option value="">Todas las Campañas</option>
                  {[...new Set(historialAplicadas.map(h => h.campana))].map(campana => (
                    <option key={campana} value={campana}>{campana}</option>
                  ))}
                </select>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(15, 23, 42, 0.8)', color: 'white', cursor: 'pointer' }}
                >
                  <option value="desc">🕒 Más recientes</option>
                  <option value="asc">🕒 Más antiguas</option>
                </select>
              </div>
            )}

            {loadingHistorial ? (
              <p style={{ color: 'var(--text-muted)' }}>Cargando historial...</p>
            ) : historialAplicadas.length > 0 ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {historialAplicadas.filter(h => {
                  const matchName = h.paciente_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchRut = h.paciente_rut?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchCampana = filtroCampana === '' || h.campana === filtroCampana;
                  return (matchName || matchRut) && matchCampana;
                }).sort((a, b) => {
                  const dateA = new Date(`${a.fecha}T${a.hora}`);
                  const dateB = new Date(`${b.fecha}T${b.hora}`);
                  return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
                }).map(h => (
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
