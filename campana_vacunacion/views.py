import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from .models import Campaña, CentroVacunacion, Cita
from .serializers import CentroVacunacionSerializer, CampañaSerializer
from manejo_usuarios.models import Paciente, Usuario

# Create your views here.

class CentroVacunacionViewSet(viewsets.ModelViewSet):
    queryset = CentroVacunacion.objects.all()
    serializer_class = CentroVacunacionSerializer

class CampañaViewSet(viewsets.ModelViewSet):
    queryset = Campaña.objects.all()
    serializer_class = CampañaSerializer

# Serie de getter usados para mostrar informacion en el frontend
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

            try:
                paciente_obj = Paciente.objects.get(rut=rut_paciente)
            except Paciente.DoesNotExist:
                # Si el usuario es Personal o Admin, no existe en la tabla Paciente.
                # Lo extendemos insertando su registro en la tabla hija Paciente.
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute("INSERT INTO manejo_usuarios_paciente (usuario_ptr_id, telefono) VALUES (%s, 0)", [rut_paciente])
                paciente_obj = Paciente.objects.get(rut=rut_paciente)

            cita = Cita.objects.get(id_cita=cita_id)

            if cita.agendar(paciente_obj):
                return JsonResponse({"mensaje": "Cita agendada exitosamente"})
            else:
                return JsonResponse({"error": "La cita ya no está disponible"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Metodo no permitido"}, status=405)

def get_citas_paciente(request, rut):
    try:
        usuario = Usuario.objects.get(rut=rut)
        
        citas_data = []
        if usuario.es_paciente:
            citas = Cita.objects.filter(paciente_citado=usuario.paciente).select_related('campana', 'centro_vacunacion')
            citas_data = [{
                "id": c.id_cita,
                "fecha": str(c.fecha_cita),
                "hora": str(c.hora_cita),
                "campana": c.campana.nombre_campaña if c.campana else "Sin campaña",
                "centro": c.centro_vacunacion.nombre_centro if c.centro_vacunacion else "Sin centro",
                "direccion": c.centro_vacunacion.obtener_direccion_completa_centro() if c.centro_vacunacion else "Dirección no registrada"
            } for c in citas]
        
        telefono = "No registrado"
        if usuario.es_paciente and usuario.paciente.telefono:
            telefono = usuario.paciente.telefono
        elif hasattr(usuario, 'personal') and usuario.personal.telefono:
            telefono = usuario.personal.telefono
        elif hasattr(usuario, 'admin') and usuario.admin.telefono:
            telefono = usuario.admin.telefono

        perfil = {
            "rut": usuario.rut,
            "nombres": usuario.nombres,
            "apellidos": usuario.apellidos,
            "correo": usuario.correo,
            "fecha_nacimiento": str(usuario.fecha_nacimiento) if usuario.fecha_nacimiento else "No registrada",
            "telefono": telefono
        }
        
        return JsonResponse({"perfil": perfil, "citas": citas_data}, safe=False)
    except Usuario.DoesNotExist:
        return JsonResponse({"error": "Usuario no encontrado"}, status=404)

@csrf_exempt
def cancelar_cita(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            cita_id = body.get('cita_id')

            cita = Cita.objects.get(id_cita=cita_id)
            if cita.cancelar():
                return JsonResponse({"mensaje": "Cita cancelada exitosamente"})
            else:
                return JsonResponse({"error": "No se pudo cancelar la cita"}, status=400)
        except Cita.DoesNotExist:
            return JsonResponse({"error": "Cita no encontrada"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Metodo no permitido"}, status=405)