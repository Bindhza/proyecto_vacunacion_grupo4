import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vacunacion.settings")
django.setup()

import traceback
from vacunas.serializers import FormularioVacunacionSerializer

s = FormularioVacunacionSerializer(data={'id_usuario': '11111111-1', 'fecha_vacunacion': '2026-07-06', 'hora_vacunacion': '10:30', 'campana': 2, 'centro_vacunacion': 1, 'observaciones': ''})
print(s.is_valid())
try:
    s.save()
    print("SAVED!")
except Exception as e:
    traceback.print_exc()
