function CampoTextoOptions(props) {
  return (
    <div className="form-group">
      <label> {props.mensaje} </label>
      <select
        value={props.valor_almacenado}
        onChange={(e) => props.onChange(e.target.value)}
        required
      >
        {/* opcion predeterminada */}
        <option value="">{props.default_value}</option>

        {/* se recorre y agrega cada opcion con stock disponible */}
        {props.data_type && props.data_type
          .filter((opcion) => opcion.stock_disponible === undefined || opcion.stock_disponible > 0)
          .map((opcion) => {
            const id = opcion.id_vacuna || opcion.id;
            const nombre = opcion.nombre_vacuna || opcion.nombre;
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