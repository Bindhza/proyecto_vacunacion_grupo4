# VacunApp - Sistema de Gestión de Vacunación 💉

VacunApp es una plataforma web moderna e integral diseñada para gestionar y organizar campañas de vacunación. El sistema permite administrar pacientes, personal de salud, campañas, centros de vacunación y citas, facilitando el proceso completo desde la llegada de la vacuna hasta su aplicación.

El proyecto está construido con un **Backend en Django (Python)** y un **Frontend en React (Vite)**, utilizando una arquitectura desacoplada comunicada a través de una API REST, y destacando por una interfaz gráfica estilo "Glassmorphism" limpia y premium.

---

## 🛠️ Tecnologías y Dependencias

### Backend (Python / Django)
- **Python** (versión 3.9 o superior)
- **Django** (Framework web principal)
- **Django REST Framework** (Para la creación de la API)
- **django-cors-headers** (Para permitir la conexión con el Frontend)
- **Base de Datos:** SQLite3 (incluida por defecto, no requiere instalación adicional)

### Frontend (Node.js / React)
- **Node.js** (versión 18 o superior recomendada)
- **React** (^19.2)
- **Vite** (^8.0) (Empaquetador y servidor de desarrollo)
- **React Router DOM** (^7.16) (Para la navegación entre páginas)
- **Axios** (^1.17) (Para las peticiones HTTP a la API)

---

## 🚀 Guía de Instalación y Ejecución

Sigue estos pasos para poner a correr el proyecto en tu máquina local.

### 1. Clonar el repositorio
```bash
git clone <url_del_repositorio>
cd proyecto_vacunacion_grupo4
```

### 2. Configurar el Backend (Django)
Asegúrate de estar en la raíz del proyecto. Es recomendable usar un entorno virtual (opcional pero recomendado):
```bash
# Crear e iniciar entorno virtual (Opcional)
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar las dependencias de Python
pip install django djangorestframework django-cors-headers

# Realizar migraciones de la base de datos
python3 manage.py makemigrations
python3 manage.py migrate

# Iniciar el servidor local de Django
python3 manage.py runserver
```
> El backend quedará corriendo en `http://localhost:8000` o `http://127.0.0.1:8000`

### 3. Configurar el Frontend (React)
Abre **una nueva terminal** y navega a la carpeta del frontend:
```bash
cd frontend

# Instalar las dependencias de Node.js
npm install

# Iniciar el servidor de desarrollo de React
npm run dev
```
> El frontend quedará corriendo normalmente en `http://localhost:5173` o el puerto que te indique Vite.

---

## 🌟 Características Principales

- **Diseño Moderno:** Interfaz de usuario con estética "Glassmorphism", totalmente responsiva y fácil de usar.
- **Roles Definidos:** Diferentes niveles de acceso (Paciente, Personal, Admin).
- **Gestión Completa:** CRUD interactivo para Campañas, Centros de Vacunación y Vacunas (Solo Admins).
- **Flujo de Agendamiento:** Proceso paso a paso y validado para agendar una cita.
- **Perfil de Usuario:** Visualización de información personal y citas vigentes para cualquier rol registrado.
- **Base de Datos Segura:** Las contraseñas están almacenadas mediante hashing nativo de Django, sin datos confidenciales expuestos en código.

---
*Proyecto desarrollado para la asignatura de Ingeniería de Software.*