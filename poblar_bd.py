import os
import django
from datetime import date, time

# Configurar el entorno de Django (debes ejecutar este script desde la raíz del proyecto)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vacunacion.settings')
django.setup()

from manejo_usuarios.models import Paciente, Personal, Admin, Historial
from campana_vacunacion.models import Campaña, CentroVacunacion, Cita, Direccion
from vacunas.models import Vacuna

def poblar_bd():
    print("Iniciando el poblamiento de la base de datos...")

    # 1. Crear Direcciones
    print("Creando Direcciones...")
    dir1, _ = Direccion.objects.get_or_create(ciudad="Santiago", calle="Av. Providencia", numero=1234)
    dir2, _ = Direccion.objects.get_or_create(ciudad="Valparaíso", calle="Pedro Montt", numero=500)
    dir3, _ = Direccion.objects.get_or_create(ciudad="Concepción", calle="Barros Arana", numero=1000)

    # 2. Crear Centros de Vacunación
    print("Creando Centros de Vacunación...")
    centro1, _ = CentroVacunacion.objects.get_or_create(
        id_centro=1,
        defaults={'nombre_centro': 'Cesfam Providencia', 'comuna_centro': 'Providencia', 'region_centro': 'Metropolitana', 'direccion_centro': dir1}
    )
    centro2, _ = CentroVacunacion.objects.get_or_create(
        id_centro=2,
        defaults={'nombre_centro': 'Hospital Carlos Van Buren', 'comuna_centro': 'Valparaíso', 'region_centro': 'Valparaíso', 'direccion_centro': dir2}
    )
    centro3, _ = CentroVacunacion.objects.get_or_create(
        id_centro=3,
        defaults={'nombre_centro': 'Hospital Regional', 'comuna_centro': 'Concepción', 'region_centro': 'Biobío', 'direccion_centro': dir3}
    )

    # 3. Crear Vacunas
    print("Creando Vacunas...")
    vacuna_influenza, _ = Vacuna.objects.get_or_create(
        id_vacuna=1,
        defaults={'nombre_vacuna': 'Influenza Tetravalente', 'cantidad_dosis': 1000}
    )
    vacuna_covid, _ = Vacuna.objects.get_or_create(
        id_vacuna=2,
        defaults={'nombre_vacuna': 'COVID-19 Bivalente', 'cantidad_dosis': 1500}
    )

    # 4. Crear Campañas
    print("Creando Campañas...")
    campana_invierno, _ = Campaña.objects.get_or_create(
        id_campaña=1,
        defaults={
            'nombre_campaña': 'Campaña Invierno 2026',
            'descripcion_campaña': 'Vacunación contra la influenza para público general',
            'fecha_inicio': date(2026, 5, 1),
            'fecha_fin': date(2026, 8, 31),
            'estado_campaña': True,
            'vacuna': vacuna_influenza
        }
    )
    campana_invierno.centros_vacunacion.add(centro1, centro2)

    campana_refuerzo, _ = Campaña.objects.get_or_create(
        id_campaña=2,
        defaults={
            'nombre_campaña': 'Refuerzo COVID-19',
            'descripcion_campaña': 'Dosis de refuerzo anual',
            'fecha_inicio': date(2026, 1, 1),
            'fecha_fin': date(2026, 12, 31),
            'estado_campaña': True,
            'vacuna': vacuna_covid
        }
    )
    campana_refuerzo.centros_vacunacion.add(centro1, centro3)

    # 5. Crear Usuarios (Admin, Personal, Paciente)
    print("Creando Usuarios...")
    
    # Admin
    rut_admin = "99999999-9"
    if not Admin.objects.filter(rut=rut_admin).exists():
        Admin.objects.create_superuser(
            rut=rut_admin,
            correo="admin.test@sistema.cl",
            nombres="Super",
            apellidos="Admin",
            fecha_nacimiento=date(1980, 1, 1),
            password="adminpassword123",
            telefono=987654321
        )

    # Personal
    rut_personal = "88888888-8"
    if not Personal.objects.filter(rut=rut_personal).exists():
        personal1 = Personal.objects.create_user(
            rut=rut_personal,
            correo="enfermero.test@cesfam.cl",
            nombres="Carlos",
            apellidos="Soto",
            fecha_nacimiento=date(1990, 5, 15),
            password="personalpassword123",
            id_personal=2001,
            centro_vacunacion=centro1,
            telefono=912345678
        )
    else:
        personal1 = Personal.objects.get(rut=rut_personal)

    # Pacientes
    rut_paciente1 = "77777777-7"
    if not Paciente.objects.filter(rut=rut_paciente1).exists():
        paciente1 = Paciente.objects.create_user(
            rut=rut_paciente1,
            correo="paciente1.test@email.com",
            nombres="Roberto",
            apellidos="Gómez",
            fecha_nacimiento=date(1995, 10, 20),
            password="pacientepassword123",
            telefono=998877665
        )
    else:
        paciente1 = Paciente.objects.get(rut=rut_paciente1)

    rut_paciente2 = "66666666-6"
    if not Paciente.objects.filter(rut=rut_paciente2).exists():
        paciente2 = Paciente.objects.create_user(
            rut=rut_paciente2,
            correo="paciente2.test@email.com",
            nombres="Laura",
            apellidos="Martínez",
            fecha_nacimiento=date(1988, 3, 10),
            password="pacientepassword123",
            telefono=991122334
        )
    else:
        paciente2 = Paciente.objects.get(rut=rut_paciente2)
        
    rut_paciente3 = "55555555-5"
    if not Paciente.objects.filter(rut=rut_paciente3).exists():
        paciente3 = Paciente.objects.create_user(
            rut=rut_paciente3,
            correo="paciente3.test@email.com",
            nombres="Diego",
            apellidos="López",
            fecha_nacimiento=date(2000, 1, 1),
            password="pacientepassword123",
            telefono=987123654
        )
    else:
        paciente3 = Paciente.objects.get(rut=rut_paciente3)

    # 6. Crear Historial (Vacunaciones pasadas)
    print("Creando Historial de Vacunación...")
    if not Historial.objects.filter(usuario=paciente1, campana=campana_invierno).exists():
        personal1.registrar_vacuna(
            usuario_receptor=paciente1,
            campana_aplicada=campana_invierno,
            centro=centro1,
            fecha=date(2025, 6, 15),
            hora=time(10, 30)
        )

    if not Historial.objects.filter(usuario=paciente2, campana=campana_refuerzo).exists():
        personal1.registrar_vacuna(
            usuario_receptor=paciente2,
            campana_aplicada=campana_refuerzo,
            centro=centro1,
            fecha=date(2025, 11, 20),
            hora=time(15, 45)
        )
        
    if not Historial.objects.filter(usuario=paciente3, campana=campana_invierno).exists():
        personal1.registrar_vacuna(
            usuario_receptor=paciente3,
            campana_aplicada=campana_invierno,
            centro=centro2,
            fecha=date(2025, 7, 10),
            hora=time(9, 15)
        )

    print("¡Base de datos poblada con éxito!")
    print("--------------------------------------------------")
    print("Credenciales de prueba generadas:")
    print(f"Admin: RUT {rut_admin} | Pass: adminpassword123")
    print(f"Personal: RUT {rut_personal} | Pass: personalpassword123")
    print(f"Paciente 1: RUT {rut_paciente1} | Pass: pacientepassword123")
    print(f"Paciente 2: RUT {rut_paciente2} | Pass: pacientepassword123")
    print(f"Paciente 3: RUT {rut_paciente3} | Pass: pacientepassword123")
    print("--------------------------------------------------")

if __name__ == "__main__":
    poblar_bd()
