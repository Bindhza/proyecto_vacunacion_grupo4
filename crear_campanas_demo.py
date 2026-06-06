import os
import django
from datetime import date, timedelta

# Configuramos Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vacunacion.settings')
django.setup()

from campana_vacunacion.models import Campaña, CentroVacunacion, Cita, Direccion
from vacunas.models import Vacuna

def crear_datos_demo():
    print("Iniciando creación de datos de campaña...")

    # 1. Crear Vacunas
    vacunas = [
        {'id_vacuna': 1, 'nombre_vacuna': 'Influenza', 'stock_disponible': 500},
        {'id_vacuna': 2, 'nombre_vacuna': 'COVID-19 Bivalente', 'stock_disponible': 300},
    ]
    for v_data in vacunas:
        v, created = Vacuna.objects.get_or_create(id_vacuna=v_data['id_vacuna'], defaults=v_data)
        if created:
            print(f"Vacuna creada: {v.nombre_vacuna}")

    # 2. Crear Direcciones y Centros
    dir1, _ = Direccion.objects.get_or_create(ciudad='Santiago', calle='Alameda', numero=123)
    centro1, created1 = CentroVacunacion.objects.get_or_create(
        id_centro=1, 
        defaults={
            'nombre_centro': 'Cesfam Santiago Centro',
            'direccion_centro': dir1,
            'comuna_centro': 'Santiago',
            'region_centro': 'Metropolitana'
        }
    )
    if created1: print("Centro creado: Cesfam Santiago Centro")

    dir2, _ = Direccion.objects.get_or_create(ciudad='Providencia', calle='Pedro de Valdivia', numero=456)
    centro2, created2 = CentroVacunacion.objects.get_or_create(
        id_centro=2, 
        defaults={
            'nombre_centro': 'Hospital del Salvador',
            'direccion_centro': dir2,
            'comuna_centro': 'Providencia',
            'region_centro': 'Metropolitana'
        }
    )
    if created2: print("Centro creado: Hospital del Salvador")

    # 3. Crear Campañas
    hoy = date.today()
    c1, created_c1 = Campaña.objects.get_or_create(
        id_campaña=1,
        defaults={
            'nombre_campaña': 'Campaña Invierno 2026',
            'descripcion_campaña': 'Vacunación contra la Influenza para grupos de riesgo',
            'fecha_inicio': hoy,
            'fecha_fin': hoy + timedelta(days=60),
            'estado_campaña': True
        }
    )
    if created_c1: print("Campaña creada: Campaña Invierno 2026")

    c2, created_c2 = Campaña.objects.get_or_create(
        id_campaña=2,
        defaults={
            'nombre_campaña': 'Refuerzo COVID-19',
            'descripcion_campaña': 'Dosis bivalente anual',
            'fecha_inicio': hoy,
            'fecha_fin': hoy + timedelta(days=90),
            'estado_campaña': True
        }
    )
    if created_c2: print("Campaña creada: Refuerzo COVID-19")

    # 4. Crear Citas Disponibles
    citas_creadas = 0
    id_cita = 1
    # Crear 3 citas para la campaña 1 en el centro 1
    for i in range(3):
        if not Cita.objects.filter(id_cita=id_cita).exists():
            Cita.objects.create(
                id_cita=id_cita,
                fecha_cita=hoy + timedelta(days=i+1),
                hora_cita='10:00:00',
                centro_vacunacion=centro1,
                estado_cita=True,
                campana=c1
            )
            citas_creadas += 1
        id_cita += 1

    # Crear 3 citas para la campaña 2 en el centro 2
    for i in range(3):
        if not Cita.objects.filter(id_cita=id_cita).exists():
            Cita.objects.create(
                id_cita=id_cita,
                fecha_cita=hoy + timedelta(days=i+1),
                hora_cita='14:30:00',
                centro_vacunacion=centro2,
                estado_cita=True,
                campana=c2
            )
            citas_creadas += 1
        id_cita += 1

    print(f"Citas disponibles creadas: {citas_creadas}")
    print("¡Base de datos poblada exitosamente!")

if __name__ == '__main__':
    crear_datos_demo()
