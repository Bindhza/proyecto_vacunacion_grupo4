import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function PerfilUsuario() {
  const [perfil, setPerfil] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user && user.rut) {
      axios.get(`http://127.0.0.1:8000/api/paciente/${user.rut}/citas/`)
        .then(response => {
          setPerfil(response.data.perfil);
          setCitas(response.data.citas);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error al cargar perfil:", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <p style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Cargando perfil...</p>;
  if (!perfil) return <p style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>No se encontró la información del perfil.</p>;

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

        <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>Mi Perfil</h2>
        
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '30px', textAlign: 'left' }}>
          <p><strong>Nombres:</strong> {perfil.nombres} {perfil.apellidos}</p>
          <p><strong>RUT:</strong> {perfil.rut}</p>
          <p><strong>Correo:</strong> {perfil.correo}</p>
          <p><strong>Fecha Nacimiento:</strong> {perfil.fecha_nacimiento}</p>
          <p><strong>Teléfono:</strong> {perfil.telefono}</p>
        </div>

        <h3 style={{ textAlign: 'left', marginBottom: '15px', color: 'var(--text-main)' }}>Mis Citas Agendadas</h3>
        {citas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'left' }}>No tienes citas agendadas.</p>
        ) : (
          <div>
            {citas.map((c) => (
              <div key={c.id} className="list-item" style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>{c.campana}</h3>
                <p style={{ margin: '5px 0', color: 'var(--primary)' }}><strong>{c.fecha} a las {c.hora}</strong></p>
                <p style={{ margin: '5px 0', color: 'var(--text-muted)' }}>{c.centro}</p>
                <p style={{ margin: '5px 0', fontSize: '0.85rem' }}>{c.direccion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PerfilUsuario;
