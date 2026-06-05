from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Campaña, CentroVacunacion, Cita
from manejo_usuarios.models import Paciente

def get_campanas(request):
    campanas = Campaña.objects.all()
    vigentes = [c for c in campanas if c.verificar_vigencia()]
    data = [{"id": c.id_campaña, "nombre": c.nombre_campaña, "descripcion": c.descripcion_campaña} for c in vigentes]
    return JsonResponse(data, safe=False)

def get_centros(request, campana_id):
    try:
        campana = Campaña.objects.get(id_campaña=campana_id)
        centros = campana.obtener_centros_disponibles()
        data = [{"id": c.id_centro, "nombre": c.nombre_centro, "direccion": c.obtener_direccion_completa_centro()} for c in centros]
        return JsonResponse(data, safe=False)
    except Campaña.DoesNotExist:
        return JsonResponse({"error": "Campaña no encontrada"}, status=404)

def get_citas(request, campana_id, centro_id):
    try:
        campana = Campaña.objects.get(id_campaña=campana_id)
        centro = CentroVacunacion.objects.get(id_centro=centro_id)
        citas = campana.verificar_horarios_y_cupos(centro)
        data = [{"id": c.id_cita, "fecha": str(c.fecha_cita), "hora": str(c.hora_cita)} for c in citas]
        return JsonResponse(data, safe=False)
    except (Campaña.DoesNotExist, CentroVacunacion.DoesNotExist):
        return JsonResponse({"error": "No encontrado"}, status=404)

@csrf_exempt
def agendar_cita(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            cita_id = body.get('cita_id')
            rut_paciente = body.get('rut_paciente')

            paciente_obj = Paciente.objects.get(rut=rut_paciente)
            cita = Cita.objects.get(id_cita=cita_id)

            if cita.agendar(paciente_obj):
                return JsonResponse({"mensaje": "Cita agendada exitosamente"})
            else:
                return JsonResponse({"error": "La cita ya no está disponible"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Metodo no permitido"}, status=405)
