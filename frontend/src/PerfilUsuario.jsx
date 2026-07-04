import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function PerfilUsuario() {
  const EditIcon = () => (
    <svg style={{ width: '16px', height: '16px', marginLeft: '8px', cursor: 'pointer', color: 'var(--primary)', verticalAlign: 'middle', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0.7} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
    </svg>
  );

  const [perfil, setPerfil] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [citaACancelar, setCitaACancelar] = useState(null);
  const [mensajeOperacion, setMensajeOperacion] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  const formatRut = (rutStr) => {
    if (!rutStr) return '';
    const cleanRut = String(rutStr).replace(/[^0-9kK]/g, '').toUpperCase();
    if (cleanRut.length <= 1) return cleanRut;
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedBody}-${dv}`;
  };

  const formatPhone = (phoneStr) => {
    if (!phoneStr || phoneStr === "No aplica" || phoneStr === "No registrado") return phoneStr;
    const p = String(phoneStr).replace(/\D/g, '');
    if (p.length === 9 && p.startsWith('9')) {
      return `+56 9 ${p.substring(1, 5)} ${p.substring(5)}`;
    }
    return phoneStr;
  };

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

  const handleEditEmailClick = () => {
    setNewEmail(perfil.correo);
    setIsEditingEmail(true);
  };

  const handleSaveEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      setIsEditingEmail(false);
      setMensajeOperacion('error: Por favor ingresa un correo electrónico con formato válido (ejemplo@correo.com).');
      setTimeout(() => setMensajeOperacion(''), 3000);
      return;
    }
    
    // Remueve puntos del rut si los tuviera antes de mandar al backend
    const rutParaBackend = user.rut.replace(/\./g, '');
    
    axios.post('http://127.0.0.1:8000/api/actualizar_correo/', { rut: rutParaBackend, correo: newEmail })
      .then(res => {
        setPerfil({...perfil, correo: newEmail});
        setIsEditingEmail(false);
        setMensajeOperacion('Correo actualizado exitosamente.');
        setTimeout(() => setMensajeOperacion(''), 3000);
      })
      .catch(err => {
        console.error('Error al actualizar correo:', err);
        setMensajeOperacion('error: Ocurrió un error al actualizar el correo.');
        setTimeout(() => setMensajeOperacion(''), 3000);
      });
  };

  const handleEditPhoneClick = () => {
    setNewPhone(perfil.telefono);
    setIsEditingPhone(true);
  };

  const handleSavePhone = () => {
    const phoneRegex = /^9[0-9]{8}$/;
    if (!newPhone || !phoneRegex.test(newPhone)) {
      setIsEditingPhone(false);
      setMensajeOperacion('error: Por favor ingresa un celular válido (debe tener 9 dígitos y comenzar con 9, ej: 912345678).');
      setTimeout(() => setMensajeOperacion(''), 4000);
      return;
    }
    
    const rutParaBackend = user.rut.replace(/\./g, '');
    
    axios.post('http://127.0.0.1:8000/api/actualizar_telefono/', { rut: rutParaBackend, telefono: newPhone })
      .then(res => {
        setPerfil({...perfil, telefono: newPhone});
        setIsEditingPhone(false);
        setMensajeOperacion('Teléfono actualizado exitosamente.');
        setTimeout(() => setMensajeOperacion(''), 3000);
      })
      .catch(err => {
        console.error('Error al actualizar teléfono:', err);
        setMensajeOperacion('error: Ocurrió un error al actualizar el teléfono.');
        setTimeout(() => setMensajeOperacion(''), 3000);
      });
  };

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
        
        {mensajeOperacion && (
          <div style={{ background: mensajeOperacion.includes('error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: mensajeOperacion.includes('error') ? '#ef4444' : '#10b981', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${mensajeOperacion.includes('error') ? '#ef4444' : '#10b981'}` }}>
            {mensajeOperacion}
          </div>
        )}
        
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '30px', textAlign: 'left' }}>
          <p><strong>Nombres:</strong> {perfil.nombres} {perfil.apellidos}</p>
          <p><strong>RUT:</strong> {formatRut(perfil.rut)}</p>
          <p style={{ display: 'flex', alignItems: 'center', margin: '15px 0' }}>
            <strong style={{ marginRight: '10px' }}>Correo:</strong>
            <span>{perfil.correo}</span>
            <span onClick={handleEditEmailClick} title="Editar Correo"><EditIcon /></span>
          </p>
          <p><strong>Fecha Nacimiento:</strong> {perfil.fecha_nacimiento}</p>
          <p style={{ display: 'flex', alignItems: 'center', margin: '15px 0' }}>
            <strong style={{ marginRight: '10px' }}>Teléfono:</strong>
            <span>{formatPhone(perfil.telefono)}</span>
            <span onClick={handleEditPhoneClick} title="Editar Teléfono"><EditIcon /></span>
          </p>
        </div>

        <h3 style={{ textAlign: 'left', marginBottom: '15px', color: 'var(--text-main)' }}>Mis Citas Agendadas</h3>
        {citas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'left' }}>No tienes citas agendadas.</p>
        ) : (
          <div>
            {citas.map((c) => (
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

      {isEditingEmail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-container" style={{ padding: '30px', maxWidth: '400px', width: '90%', textAlign: 'center', background: 'rgba(15, 23, 42, 0.95)' }}>
            <h3 style={{ marginBottom: '15px' }}>Actualizar Correo</h3>
            <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Ingresa tu nueva dirección de correo electrónico:</p>
            <input 
              type="email" 
              value={newEmail} 
              onChange={(e) => setNewEmail(e.target.value)} 
              placeholder="ejemplo@correo.com"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem', marginBottom: '25px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button onClick={() => setIsEditingEmail(false)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '10px 20px', flex: 1 }}>Cancelar</button>
              <button onClick={handleSaveEmail} style={{ background: 'var(--primary)', border: 'none', padding: '10px 20px', flex: 1 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {isEditingPhone && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-container" style={{ padding: '30px', maxWidth: '400px', width: '90%', textAlign: 'center', background: 'rgba(15, 23, 42, 0.95)' }}>
            <h3 style={{ marginBottom: '15px' }}>Actualizar Teléfono</h3>
            <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Ingresa tu celular (9 dígitos, comenzando con 9):</p>
            <input 
              type="text" 
              value={newPhone} 
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 9) setNewPhone(val);
              }} 
              placeholder="Ej. 912345678"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem', marginBottom: '25px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button onClick={() => setIsEditingPhone(false)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '10px 20px', flex: 1 }}>Cancelar</button>
              <button onClick={handleSavePhone} style={{ background: 'var(--primary)', border: 'none', padding: '10px 20px', flex: 1 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerfilUsuario;
