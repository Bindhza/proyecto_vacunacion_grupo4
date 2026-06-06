import os
import django

# Configuramos Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vacunacion.settings')
django.setup()

from manejo_usuarios.models import Paciente, Personal, Admin, Usuario

def crear_usuarios():
    # Crear Paciente
    if not Usuario.objects.filter(rut='11111111-1').exists():
        p = Paciente(rut='11111111-1', nombres='Paciente', apellidos='De Prueba', correo='paciente@prueba.com', fecha_nacimiento='1990-01-01', telefono=12345678)
        p.set_password('admin')
        p.save()
        print("Paciente '11111111-1' creado exitosamente.")
    else:
        print("El Paciente '11111111-1' ya existe.")

    # Crear Personal
    if not Usuario.objects.filter(rut='22222222-2').exists():
        pe = Personal(rut='22222222-2', nombres='Personal', apellidos='De Prueba', correo='personal@prueba.com', fecha_nacimiento='1990-01-01', id_personal=1)
        pe.set_password('admin')
        pe.save()
        print("Personal '22222222-2' creado exitosamente.")
    else:
        print("El Personal '22222222-2' ya existe.")

    # Crear Admin
    if not Usuario.objects.filter(rut='33333333-3').exists():
        a = Admin(rut='33333333-3', nombres='Admin', apellidos='De Prueba', correo='admin@prueba.com', fecha_nacimiento='1990-01-01')
        a.set_password('admin')
        a.save()
        print("Admin '33333333-3' creado exitosamente.")
    else:
        print("El Admin '33333333-3' ya existe.")

if __name__ == '__main__':
    print("Inyectando usuarios demo en la base de datos...")
    crear_usuarios()
    print("¡Listo!")
