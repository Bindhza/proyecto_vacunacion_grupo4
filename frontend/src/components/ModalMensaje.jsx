import React, { useState, useEffect } from 'react';

const ModalMensaje = ({ show, mensaje, esError, esConfirm, esCritico, onConfirm, onClose }) => {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (!show) {
            setInputValue('');
        }
    }, [show]);

    if (!show) return null;

    const canConfirm = !esCritico || inputValue.toUpperCase() === 'ELIMINAR';

    // Determinar el color base según el tipo de mensaje
    const baseColor = esError ? '#ef4444' : (esCritico ? '#ef4444' : (esConfirm ? '#3b82f6' : '#10b981'));

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-container" style={{ padding: '30px', maxWidth: '400px', width: '90%', textAlign: 'center', background: 'rgba(15, 23, 42, 0.98)', border: `1px solid ${baseColor}`, boxShadow: `0 8px 32px ${esError ? 'rgba(239, 68, 68, 0.3)' : (esCritico ? 'rgba(239, 68, 68, 0.3)' : (esConfirm ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'))}` }}>
                <h3 style={{ marginBottom: '15px', color: baseColor, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    {esError || esCritico ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    ) : esConfirm ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    )}
                    {esError ? 'Error' : esCritico ? 'Atención: Acción Irreversible' : esConfirm ? 'Confirmación' : 'Éxito'}
                </h3>
                <p style={{ marginBottom: '25px', color: 'white', fontSize: '1.1rem' }}>{mensaje}</p>
                
                {esCritico && (
                    <div style={{ marginBottom: '25px' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                            Por seguridad, por favor escribe <strong>ELIMINAR</strong> para confirmar esta acción.
                        </p>
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Escribe ELIMINAR"
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                borderRadius: '8px', 
                                border: '1px solid var(--glass-border)', 
                                background: 'rgba(255,255,255,0.05)', 
                                color: 'white', 
                                textAlign: 'center',
                                outline: 'none'
                            }}
                        />
                    </div>
                )}

                {esConfirm ? (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button 
                            onClick={onConfirm} 
                            disabled={!canConfirm}
                            style={{ 
                                background: canConfirm ? baseColor : 'rgba(255,255,255,0.1)', 
                                border: 'none', 
                                color: canConfirm ? 'white' : 'rgba(255,255,255,0.4)',
                                padding: '10px 20px', 
                                fontWeight: 'bold', 
                                width: 'auto',
                                cursor: canConfirm ? 'pointer' : 'not-allowed',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Aceptar
                        </button>
                        <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${baseColor}`, color: 'white', padding: '10px 20px', fontWeight: 'bold', width: 'auto' }}>Cancelar</button>
                    </div>
                ) : (
                    <button onClick={onClose} style={{ background: esError ? '#ef4444' : '#10b981', border: 'none', padding: '10px 30px', fontWeight: 'bold' }}>Entendido</button>
                )}
            </div>
        </div>
    );
};

export default ModalMensaje;
