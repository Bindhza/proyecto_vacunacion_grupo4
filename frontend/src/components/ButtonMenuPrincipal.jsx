import { Link } from 'react-router-dom'

function ButtonMenuPrincipal(props){
    return (
        <div style={{ marginBottom: '15px' }}>
            <Link to={props.ruta} title={props.title || props.mensaje}>
                <button style={{ fontSize: '18px', padding: '12px 24px', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    {props.mensaje}
                </button>
            </Link>
        </div>
    );
}

export default ButtonMenuPrincipal