import React, { useState, useRef, useEffect } from 'react';

function CampoTextoOptions(props) {
  if (props.multiple) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Close on click outside
    useEffect(() => {
      function handleClickOutside(event) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleCheckboxChange = (id) => {
      const currentValues = props.valor_almacenado || [];
      const newValues = currentValues.includes(String(id))
        ? currentValues.filter(v => v !== String(id))
        : [...currentValues, String(id)];
      props.onChange(newValues);
    };

    const getDisplayValue = () => {
      if (!props.valor_almacenado || props.valor_almacenado.length === 0) return props.default_value || "-- Seleccione --";
      return `${props.valor_almacenado.length} seleccionados`;
    };

    return (
      <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
        <label> {props.mensaje} </label>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            border: '1px solid var(--glass-border)',
            padding: '12px 14px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            cursor: 'pointer',
            color: 'var(--text-main)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '1rem',
            fontFamily: 'inherit'
          }}
        >
          <span>{getDisplayValue()}</span>
          <span style={{ fontSize: '0.8em', opacity: 0.7 }}>▼</span>
        </div>
        
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            right: 0,
            background: '#1e293b', 
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            maxHeight: '220px',
            overflowY: 'auto',
            zIndex: 9999,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
          }}>
            {props.data_type && props.data_type.map((opcion) => {
              const id = opcion.id_vacuna || opcion.id_centro || opcion.id;
              const nombre = opcion.nombre_vacuna || opcion.nombre_centro || opcion.nombre;
              const isChecked = (props.valor_almacenado || []).includes(String(id));
              
              return (
                <div 
                  key={id} 
                  onClick={() => handleCheckboxChange(id)}
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    transition: 'background 0.2s',
                    background: isChecked ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isChecked) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isChecked) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={() => {}}
                    style={{ marginRight: '12px', cursor: 'pointer', width: '18px', height: '18px', accentColor: '#3b82f6' }}
                  />
                  <span style={{ color: '#fff', fontSize: '0.95rem' }}>{nombre}</span>
                </div>
              );
            })}
            {props.data_type && props.data_type.length === 0 && (
              <div style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                No hay opciones disponibles
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Comportamiento original para single select
  return (
    <div className="form-group">
      <label> {props.mensaje} </label>
      <select
        value={props.valor_almacenado}
        onChange={(e) => props.onChange(e.target.value)}
        required={props.required !== false}
      >
        <option value="">{props.default_value}</option>
        {props.data_type && props.data_type
          .filter((opcion) => opcion.stock_disponible === undefined || opcion.stock_disponible > 0)
          .map((opcion) => {
            const id = opcion.id_vacuna || opcion.id_centro || opcion.id;
            const nombre = opcion.nombre_vacuna || opcion.nombre_centro || opcion.nombre;
            return (
              <option key={id} value={id}>
                {nombre}
              </option>
            );
          })}
      </select>
    </div>
  );
}

export default CampoTextoOptions;