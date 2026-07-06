from vacunacion.mails import enviar_correo_confirmacion
import json
# pyrefly: ignore [missing-import]
from django.shortcuts import render
# pyrefly: ignore [missing-import]
from django.http import JsonResponse
# pyrefly: ignore [missing-import]
from django.views.decorators.csrf import csrf_exempt
# pyrefly: ignore [missing-import]
from rest_framework import viewsets
# pyrefly: ignore [missing-import]
from .models import Campaña, CentroVacunacion, Cita
# pyrefly: ignore [missing-import]
from .serializers import CentroVacunacionSerializer, CampañaSerializer
# pyrefly: ignore [missing-import]
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
        # Usar los centros asociados directamente
        if campana.centros_vacunacion.exists():
            centros = campana.centros_vacunacion.all()
        else:
            centros = campana.obtener_centros_disponibles()
            
        data = [{"id": c.id_centro, "nombre": c.nombre_centro, "direccion": c.obtener_direccion_completa_centro()} for c in centros]
        return JsonResponse(data, safe=False)
    except Campaña.DoesNotExist:
        return JsonResponse({"error": "Campaña no encontrada"}, status=404)

def get_citas(request, campana_id, centro_id):
    try:
        campana = Campaña.objects.get(id_campaña=campana_id)
        centro = CentroVacunacion.objects.get(id_centro=centro_id)
        
        # Si no existen citas para esta campaña en este centro, las generamos automáticamente
        if not Cita.objects.filter(campana=campana, centro_vacunacion=centro).exists():
            from datetime import timedelta, datetime
            fecha_actual = campana.fecha_inicio
            cita_id_counter = Cita.objects.all().order_by('-id_cita').first()
            current_id = (cita_id_counter.id_cita + 1) if cita_id_counter else 1
            
            citas_to_create = []
            while fecha_actual <= campana.fecha_fin:
                hora = datetime.strptime('09:00', '%H:%M')
                hora_fin = datetime.strptime('17:00', '%H:%M')
                while hora < hora_fin:
                    for _ in range(10): # 10 cupos
                        citas_to_create.append(Cita(
                            id_cita=current_id,
                            fecha_cita=fecha_actual,
                            hora_cita=hora.time(),
                            centro_vacunacion=centro,
                            estado_cita=True,
                            campana=campana
                        ))
                        current_id += 1
                    hora += timedelta(minutes=15)
                fecha_actual += timedelta(days=1)
            Cita.objects.bulk_create(citas_to_create)

        # Obtener TODAS las citas para este centro y campaña (disponibles y ocupadas)
        todas_citas = Cita.objects.filter(campana=campana, centro_vacunacion=centro)
        
        # Agrupar las citas por fecha y hora
        agrupados = {}
        for c in todas_citas:
            key = f"{c.fecha_cita}_{c.hora_cita}"
            if key not in agrupados:
                agrupados[key] = {
                    "id": c.id_cita, # enviamos un ID representativo del bloque
                    "fecha": str(c.fecha_cita),
                    "hora": str(c.hora_cita)[:5], # Formato HH:MM
                    "cupos": 1 if c.estado_cita else 0
                }
            else:
                if c.estado_cita:
                    agrupados[key]["cupos"] += 1
                
        # Enviar todos los horarios (con cupos y sin cupos)
        data = list(agrupados.values())
        # Ordenar por fecha y luego por hora
        data.sort(key=lambda x: (x["fecha"], x["hora"]))
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
                # pyrefly: ignore [missing-import]
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute("INSERT INTO manejo_usuarios_paciente (usuario_ptr_id, telefono) VALUES (%s, 0)", [rut_paciente])
                paciente_obj = Paciente.objects.get(rut=rut_paciente)

            cita = Cita.objects.get(id_cita=cita_id)

            cita_a_cancelar = body.get('cita_a_cancelar')
            
            # Validación: una hora por día
            citas_mismo_dia = Cita.objects.filter(paciente_citado=paciente_obj, fecha_cita=cita.fecha_cita)
            if cita_a_cancelar:
                citas_mismo_dia = citas_mismo_dia.exclude(id_cita=cita_a_cancelar)
            
            if citas_mismo_dia.exists():
                return JsonResponse({"error": "Solo se permite agendar una hora por día."}, status=400)

            # Validación: una hora por campaña (no agendar otra cita para la misma campaña)
            citas_misma_campana = Cita.objects.filter(paciente_citado=paciente_obj, campana=cita.campana)
            if cita_a_cancelar:
                citas_misma_campana = citas_misma_campana.exclude(id_cita=cita_a_cancelar)
            
            if citas_misma_campana.exists():
                return JsonResponse({"error": "Ya tienes una cita agendada para esta campaña en otra fecha."}, status=400)

            if cita.agendar(paciente_obj):
                # Si se pasó una cita para reagendar, la cancelamos ahora que el reagendamiento fue exitoso
                cita_a_cancelar = body.get('cita_a_cancelar')
                if cita_a_cancelar:
                    try:
                        vieja_cita = Cita.objects.get(id_cita=cita_a_cancelar)
                        # Por seguridad confirmamos que le pertenezca al paciente
                        if vieja_cita.paciente_citado == paciente_obj:
                            vieja_cita.cancelar()
                    except Cita.DoesNotExist:
                        pass

                # intenta enviar correo mediante un try, si la creacion del paciente no es correcta, no se envia el correo
                # si no se envia el mail no se cancela la cita
                try:
                    nombre_paciente = f"{paciente_obj.nombres} {paciente_obj.apellidos}"
                    nombre_vacuna = cita.campana.nombre_campaña if cita.campana else "Campaña de Vacunación"
                    centro_nombre = cita.centro_vacunacion.nombre_centro if cita.centro_vacunacion else "Centro de Vacunación"
                    centro_direccion = cita.centro_vacunacion.obtener_direccion_completa_centro() if cita.centro_vacunacion else "Dirección no registrada"

                    enviar_correo_confirmacion(
                        email_destino="be.pobletecastillo@gmail.com",
                        nombre_paciente=nombre_paciente,
                        nombre_vacuna=nombre_vacuna,
                        cita_fecha=str(cita.fecha_cita),
                        cita_hora=str(cita.hora_cita),
                        centro_nombre=centro_nombre,
                        centro_direccion=centro_direccion
                    )
                except Exception as mail_error:
                    print(f"Error enviando correo de confirmación: {mail_error}")
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
                "campana_id": c.campana.id_campaña if c.campana else None,
                "centro": c.centro_vacunacion.nombre_centro if c.centro_vacunacion else "Sin centro",
                "centro_id": c.centro_vacunacion.id_centro if c.centro_vacunacion else None,
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
        
        historial_data = []
        if usuario.es_paciente:
            historial = usuario.historial_set.all().select_related('campana', 'centro_vacunacion')
            historial_data = [{
                "id": h.id,
                "fecha": str(h.fecha),
                "hora": str(h.hora)[:5],
                "campana": h.campana.nombre_campaña if h.campana else "Desconocida",
                "centro": h.centro_vacunacion.nombre_centro if h.centro_vacunacion else "Desconocido",
                "dosis": h.dosis
            } for h in historial]

        historial_aplicadas_data = []
        if usuario.es_personal:
            historial_aplicadas = usuario.personal.vacunaciones_realizadas.all().select_related('campana', 'centro_vacunacion', 'usuario')
            historial_aplicadas_data = [{
                "id": h.id,
                "fecha": str(h.fecha),
                "hora": str(h.hora)[:5],
                "campana": h.campana.nombre_campaña if h.campana else "Desconocida",
                "centro": h.centro_vacunacion.nombre_centro if h.centro_vacunacion else "Desconocido",
                "paciente_rut": h.usuario.rut,
                "paciente_nombre": f"{h.usuario.nombres} {h.usuario.apellidos}",
                "dosis": h.dosis
            } for h in historial_aplicadas]
            
        return JsonResponse({
            "perfil": perfil, 
            "citas": citas_data, 
            "historial": historial_data, 
            "historial_aplicadas": historial_aplicadas_data
        }, safe=False)
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