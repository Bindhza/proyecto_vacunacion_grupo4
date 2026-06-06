# VacunApp - Sistema de Gestión de Vacunación

VacunApp es una plataforma web moderna e integral diseñada para gestionar y organizar campañas de vacunación. El sistema permite administrar pacientes, personal de salud, campañas, centros de vacunación y citas, facilitando el proceso completo desde la llegada de la vacuna hasta su aplicación.

El proyecto está construido con un **Backend en Django (Python)** y un **Frontend en React (Vite)**, utilizando una arquitectura desacoplada comunicada a través de una API REST, y destacando por una interfaz gráfica estilo "Glassmorphism" limpia y premium.

---

## Guía de Instalación y Ejecución

### 1. Configurar el Backend (Django)

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

### 2. Configurar el Frontend (React)

cd frontend

# Instalar las dependencias de Node.js
npm install

# Iniciar el servidor de desarrollo de React
npm run dev

---

## Características Principales

- **Diseño Moderno:** Interfaz de usuario con estética visual cuidada totalmente responsiva y fácil de usar.
- **Roles Definidos:** Diferentes niveles de acceso (Paciente, Personal, Admin).
- **Gestión Completa:** CRUD interactivo para Campañas, Centros de Vacunación y Vacunas (Solo Admins).
- **Flujo de Agendamiento:** Proceso paso a paso y validado para agendar una cita.
- **Perfil de Usuario:** Visualización de información personal y citas vigentes para cualquier rol registrado.
- **Base de Datos Segura:** Las contraseñas están almacenadas mediante hashing nativo de Django, sin datos confidenciales expuestos en código.

## Acerca del diseño

Esta implementacion esta diseñada en base a una serie de diagramas que fueron elaborados con el fin de guiar el desarrollo del software, dicho diseño puede ser encontrado dentro de la carpeta diagramas de este mismo repositorio, donde se pueden consultar las secuencias logicas, la organizacion del sistema y los modelos de datos, asi como sus justificaciones, ademas de una descripción detallada de la seguridad implementada en la aplicacion.

## Implementacion Basica
Esta primera implementacion se considera una version muy rudimentaria de lo que seria la version finalizada del programa, hay muchos detalles que no estan completados al 100 como podria ser, la implementacion de notificaciones, un dashboard para administradores o personal de salud, un mejor sistema de agendamiento, con horas, stock visible y cupos, esto y diversos otros detalles seran barajados e implementados en futuras versiones.
---
*Proyecto desarrollado para la asignatura Diseño de Software.*
