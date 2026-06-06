## 1. Componentes Clave del Modelo  
## Seguridad en Cuentas y Contraseñas  
El registro y la gestión de usuarios se centralizan en la app manejo_usuarios mediante UsuarioManager. Para no guardar nunca contraseñas en texto plano, usamos el método nativo user.set_password(), que aplica hashing PBKDF2 con SHA256 y una sal aleatoria única.

Cuando alguien intenta iniciar sesión (login_view), recibimos el RUT y la contraseña en un JSON. El sistema procesa la clave de entrada y valida matemáticamente si coincide con el hash almacenado en db.sqlite3.

## Gestión de Sesiones por Token  
Una vez que el usuario se autentica con éxito en /api/login/, el backend genera y firma digitalmente un token. Desde ese momento, el frontend debe guardarlo y enviarlo en la cabecera de cada petición HTTP usando el formato Authorization: Token <valor>.

Por seguridad, los tokens tienen una validez estricta de 30 minutos. En cuanto se cumple ese tiempo, los interceptores del backend cortan el acceso a las vistas de campana_vacunacion y vacunas, devolviendo un error HTTP 401 Unauthorized hasta que el usuario se loguee nuevamente.

## Control de Acceso por Roles (RBAC)  
Los permisos en el sistema se dividen estrictamente según el tipo de Usuario:

Paciente: Es el rol con menos privilegios. Solo puede hacer consultas (GET) de campañas o centros. Su única acción de escritura es reservar su propio cupo a través de agendar_cita.

Personal: Es el rol para el equipo médico. El sistema valida su identidad en ValidarPersonalAPIView y les permite ejecutar el método transaccional personal.registrar_vacuna() al inmunizar a un ciudadano.

Administrador (is_staff / is_superuser): Control total de la infraestructura. Son los únicos que pueden entrar a admin.site.urls para mover el catálogo maestro o actualizar el stock_disponible de las vacunas.

Validación de Identidad y Transacciones Seguras  
Para evitar que un usuario suplante a otro, la función agendar_cita hace un filtro cruzado. Verifica que el rut_paciente en el cuerpo del JSON coincida exactamente con el dueño del token extraído de la cabecera.

Por otro lado, el registro de vacunación se maneja mediante FormularioVacunacionSerializer dentro de un bloque con transaction.atomic(). Esto asegura que si algo falla al conectar con la campaña o el usuario, el sistema aplica un rollback inmediato. Así evitamos registros huérfanos o desajustes entre el inventario físico y la base de datos.

## 2. Flujo de Autenticación y Consumo  
El camino que sigue una petición segura se puede resumir en cinco pasos:

1. Login: El usuario envía su RUT y contraseña vía POST al endpoint /api/login/.

2. Emisión: La vista login_view verifica las credenciales, genera el token calculando su expiración (Hora Actual + 30 minutos) y lo responde con un HTTP 200 OK.

3. Petición protegida: El cliente intenta consumir un servicio (por ejemplo, registrar una dosis en CrearVacunacionRegistroAPIView) enviando el token en los headers.

4. Filtro del Middleware: El middleware de seguridad intercepta la llamada. Si pasaron los 30 minutos, rechaza la petición con un HTTP 401. Si sigue vigente, extrae el rol (ej: "Personal") y permite la petición.

5. Persistencia: La vista confirma que el rol tenga permisos de escritura. Si todo está en orden, el bloque transaccional inserta los registros en Vacunacion y UsuarioRecibioVacuna, descuenta el stock en Vacuna y cierra el ciclo con un HTTP 201 Created.