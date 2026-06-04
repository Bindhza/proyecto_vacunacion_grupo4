import { Link } from 'react-router-dom'

function ButtonMenuPrincipal(props){
    return (
        <div style={{ marginBottom: '15px' }}>
            <Link to={props.ruta}>
                <button style={{ fontSize: '18px', padding: '12px 24px', cursor: 'pointer' }}>
                    {props.mensaje}
                </button>
            </Link>
        </div>
    );
}

export default ButtonMenuPrincipal