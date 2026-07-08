# VacunApp - Sistema de Gestión de Vacunación

> Plataforma web moderna e integral diseñada para gestionar y organizar campañas de vacunación.

VacunApp es una plataforma web moderna e integral diseñada para gestionar y organizar campañas de vacunación. El sistema permite administrar pacientes, personal de salud, campañas, centros de vacunación y citas, facilitando el proceso completo desde la llegada de la vacuna hasta su aplicación.

El proyecto está construido con un **Backend en Django (Python)** y un **Frontend en React (Vite)**, utilizando una arquitectura desacoplada comunicada a través de una API REST, y destacando por una interfaz gráfica estilo **Glassmorphism** limpia y premium.

---
## Integrantes

- **Bryan Aguirre Fuentes**
- **Camila García Torres** 
- **José González Aguayo**
- **Benjamín López Hermosilla**
- **Benjamin Poblete Castillo**

---

## Guía de Instalación y Ejecución

### 1. Configurar el Backend (Django)

```bash
# Crear e iniciar entorno virtual (Opcional)
python3 -m venv venv
source venv/bin/activate

# En Windows:
venv\Scripts\activate

# Instalar las dependencias de Python requeridas
pip install django djangorestframework django-cors-headers python-dotenv django-anymail

# Realizar migraciones de la base de datos
python3 manage.py makemigrations
python3 manage.py migrate

# Iniciar el servidor local de Django
python3 manage.py runserver
```

---

### 2. Configurar el Frontend (React)

```bash
cd frontend

# Instalar las dependencias de Node.js
npm install

# Iniciar el servidor de desarrollo de React
npm run dev
```

---

## Características Principales

| Característica            | Descripción                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Diseño Moderno**        | Interfaz de usuario con estética visual cuidada totalmente responsiva y fácil de usar.                             |
| **Roles Definidos**       | Diferentes niveles de acceso (Paciente, Personal, Admin).                                                          |
| **Gestión Completa**      | CRUD interactivo para Campañas, Centros de Vacunación y Vacunas (Solo Admins).                                     |
| **Flujo de Agendamiento** | Proceso paso a paso y validado para agendar una cita.                                                              |
| **Perfil de Usuario**     | Visualización de información personal y citas vigentes para cualquier rol registrado.                              |
| **Base de Datos Segura**  | Las contraseñas están almacenadas mediante hashing nativo de Django, sin datos confidenciales expuestos en código. |

---

## Acerca del diseño

Esta implementacion esta diseñada en base a una serie de diagramas que fueron elaborados con el fin de guiar el desarrollo del software, dicho diseño puede ser encontrado dentro de la carpeta **diagramas** de este mismo repositorio, donde se pueden consultar las secuencias logicas, la organizacion del sistema y los modelos de datos, asi como sus justificaciones, ademas de una descripción detallada de la seguridad implementada en la aplicacion.

---

## Estado Actual de la Aplicación

Esta versión finalizada del sistema integra múltiples características avanzadas centradas en la usabilidad y la integridad de los datos. Entre sus capacidades actuales se incluyen:

- **Sistema de Agendamiento Robusto:** Los pacientes pueden agendar citas con control dinámico de cupos (máximo 10 personas cada 15 minutos) e información de direcciones completas.
- **Flexibilidad y Control (UX):** Posibilidad de cancelar o reagendar citas fácilmente desde el perfil, con ventanas de confirmación para evitar errores accidentales.
- **Historiales Dinámicos:** Seguimiento en tiempo real de vacunas recibidas (para pacientes) y administradas (para el personal), con filtros por RUT y ordenamiento cronológico.
- **Gestión Administrativa Segura:** El administrador cuenta con interfaces de búsqueda integradas y un sistema *Soft-Lock* para confirmar la eliminación de campañas o centros críticos de la base de datos.
- **Diseño Premium:** Uso de componentes estéticos consistentes que mejoran la experiencia de uso general.

## Credenciales de prueba

El sistema cuenta con las siguientes cuentas pre-configuradas para probar los distintos perfiles de acceso:

### Administradores
* Rut: `99999999-9` | Contraseña: `adminpassword123`
* Rut: `33333333-3` | Contraseña: `admin`

### Personal de Salud (Enfermeros)
* Rut: `88888888-8` | Contraseña: `personalpassword123`
* Rut: `22222222-2` | Contraseña: `admin`

### Pacientes
* Rut: `77777777-7` | Contraseña: `pacientepassword123`
* Rut: `66666666-6` | Contraseña: `pacientepassword123`
* Rut: `55555555-5` | Contraseña: `pacientepassword123`
* Rut: `11111111-1` | Contraseña: `admin`

---

## Arquitectura Tecnológica

| Componente   | Tecnología                     |
| ------------ | ------------------------------ |
| Backend      | Django + Django REST Framework |
| Frontend     | React + Vite                   |
| Comunicación | API REST                       |
| Persistencia | Django ORM                     |

---

## Demostracion en video
https://drive.google.com/file/d/1CWsQg-Rj63e_rsj0Bkx-aAnbCATQyCnQ/view?usp=sharing

---

## Prueba de Integración de Correos 

El sistema ya está programado para enviar automáticamente un correo electrónico de confirmación cada vez que un paciente agenda una cita exitosamente. 

Debido a las restricciones de envio gratuito, para poder probar esta funcionalidad se deben seguir los siguientes pasos:

1. **Crear cuenta en Resend:** El evaluador debe registrarse gratuitamente en [Resend.com](https://resend.com) usando su correo personal o institucional
2. **Obtener API Key:** Desde el dashboard de Resend, generar una nueva API Key.
3. **Configurar el entorno (.env):** Crear un archivo `.env` en la raíz del proyecto y escribir lo siguiente:
   ```env
   RESEND_API_KEY=aqui_va_la_api_key
   DEFAULT_FROM_EMAIL=onboarding@resend.dev
   ```
4. **Asignar el correo al Paciente:** Modificar el `correo` de uno de los pacientes de prueba y colocar **exactamente el mismo correo** con el que se registró en Resend. *(Resend restringe los envíos gratuitos únicamente al correo dueño de la cuenta)*.
5. **Agendar:** Agendar una cita y revisar la bandeja de entrada.

## Información Académica

Proyecto desarrollado para la asignatura **Diseño de Software**.
