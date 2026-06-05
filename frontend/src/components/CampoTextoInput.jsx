function CampoTextoInput(props) {
  return (
    <div style={{ marginBottom: '10px' }}>
      {/*etiqueta asociada al campo de texto*/}
      <label>{props.mensaje}</label>
      {/*entrada*/}
      <input
        type={props.tipo_dato}
        placeholder={props.ejemplo}
        value={props.valor_almacenado}
        //atento al cambio en el input
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}

export default CampoTextoInput;