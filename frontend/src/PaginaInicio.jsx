import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function PaginaInicio() {
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        rut,
        password
      })
      
      if (response.data.usuario) {
        localStorage.setItem('user', JSON.stringify(response.data.usuario))
        navigate('/sistema')
      }
    } catch (err) {
      setError('Credenciales inválidas o error en el servidor')
      console.error(err)
    }
  }

  return (
    <div className="bpmn-interface-root" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div className="glass-container" style={{ textAlign: 'center', width: '90%', maxWidth: '400px', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#333' }}>Iniciar Sesión</h1>
        <p className="subtitle" style={{ fontSize: '1rem', marginBottom: '30px', color: '#666' }}>
          Sistema de Vacunación
        </p>

        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>RUT</label>
            <input 
              type="text" 
              value={rut} 
              onChange={(e) => setRut(e.target.value)} 
              placeholder="Ej. 12345678-9" 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              required 
            />
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Contraseña" 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              required 
            />
          </div>

          <button type="submit" style={{ 
            padding: '14px', 
            borderRadius: '8px', 
            fontSize: '1.1rem', 
            backgroundColor: '#10b981', 
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '10px'
          }}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}

export default PaginaInicio
