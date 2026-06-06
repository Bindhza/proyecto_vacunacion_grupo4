import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vacunacion.settings')
django.setup()

from manejo_usuarios.models import Usuario

print("--- Usuarios en la Base de Datos ---")
for u in Usuario.objects.all():
    is_paciente = hasattr(u, 'paciente')
    is_personal = hasattr(u, 'personal')
    is_admin = hasattr(u, 'admin')
    roles = []
    if is_paciente: roles.append('Paciente')
    if is_personal: roles.append('Personal')
    if is_admin: roles.append('Admin')
    
    print(f"RUT: '{u.rut}', Nombres: {u.nombres}, Roles: {roles}, Hash Pwd: {u.password[:20]}...")
