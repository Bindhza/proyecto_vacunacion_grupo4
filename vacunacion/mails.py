# pyrefly: ignore [missing-import]
from django.core.mail import EmailMultiAlternatives 
# pyrefly: ignore [missing-import]
from django.template.loader import render_to_string
# pyrefly: ignore [missing-import]
from django.utils.html import strip_tags
# pyrefly: ignore [missing-import]
from django.conf import settings

def enviar_correo_confirmacion(email_destino, nombre_paciente, nombre_vacuna, cita_fecha, cita_hora, centro_nombre, centro_direccion):
    context = {
        "paciente_nombre": nombre_paciente or "Paciente",
        "vacuna_nombre": nombre_vacuna or "Campaña de Vacunación",
        "fecha_cita": cita_fecha or "Fecha no registrada",
        "hora_cita": cita_hora or "Hora no registrada",
        "centro_nombre": centro_nombre or "Centro de Vacunación",
        "centro_direccion": centro_direccion or "Dirección no registrada",
    }
    
    # 1. Renderiza el HTML con los datos dinámicos
    html_content = render_to_string("mails/confirmacion_hora.html", context)
    # 2. Crea una versión en texto plano (por accesibilidad)
    text_content = strip_tags(html_content)
    
    msg = EmailMultiAlternatives(
        subject="Confirmación de tu Cita de Vacunación",
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email_destino]
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()


def enviar_post_vacunacion(email_destino, nombre_paciente, nombre_vacuna, cita_fecha, nombre_centro):
    context = {
        "paciente_nombre": nombre_paciente or "Paciente",
        "vacuna_nombre": nombre_vacuna or "Campaña de Vacunación",
        "cita_fecha": cita_fecha or "Fecha no registrada",
        "centro_nombre": nombre_centro or "Centro de Vacunación",
    }
    
    # 1. Renderiza el HTML con los datos dinámicos
    html_content = render_to_string("mails/post_vacunacion.html", context)
    # 2. Crea una versión en texto plano (por accesibilidad)
    text_content = strip_tags(html_content)
    
    msg = EmailMultiAlternatives(
        subject="Comprobante de Vacunación e Información Post-Inoculación",
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email_destino]
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()

def enviar_recordatorio_cita(email_destino, nombre_paciente, nombre_vacuna, cita_fecha, cita_hora, centro_nombre, centro_direccion):
    context = {
        "paciente_nombre": nombre_paciente or "Paciente",
        "vacuna_nombre": nombre_vacuna or "Campaña de Vacunación",
        "fecha_cita": cita_fecha or "Fecha no registrada",
        "hora_cita": cita_hora or "Hora no registrada",
        "centro_nombre": centro_nombre or "Centro de Vacunación",
        "centro_direccion": centro_direccion or "Dirección no registrada",
    }
    
    # 1. Renderiza el HTML con los datos dinámicos
    html_content = render_to_string("mails/recordatorio_cita.html", context)
    # 2. Crea una versión en texto plano (por accesibilidad)
    text_content = strip_tags(html_content)
    
    msg = EmailMultiAlternatives(
        subject="Recordatorio de tu Cita de Vacunación",
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email_destino]
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()


def enviar_recordatorios_pendientes():
    from django.utils import timezone
    from datetime import timedelta
    from campana_vacunacion.models import Cita

    tomorrow = timezone.now().date() + timedelta(days=1)
    # Traemos todas las citas agendadas para mañana que no han sido enviadas exitosamente y tienen menos de 3 intentos
    citas_candidatas = Cita.objects.filter(
        fecha_cita=tomorrow,
        estado_cita=False,  # False significa agendada/reservada para un paciente
        recordatorio_enviado=False,
        intentos_recordatorio__lt=3
    )

    ahora = timezone.now()
    citas_a_procesar = []

    for cita in citas_candidatas:
        # Si ya se intentó antes, validar que haya pasado al menos 1 hora
        if cita.ultimo_intento_recordatorio:
            if ahora < cita.ultimo_intento_recordatorio + timedelta(hours=1):
                continue  # Aún no pasa 1 hora, omitir en esta ronda
        citas_a_procesar.append(cita)

    print(f"[Recordatorios] Procesando {len(citas_a_procesar)} citas candidatas para mañana...")

    for cita in citas_a_procesar:
        paciente = cita.paciente_citado
        if not paciente or not paciente.correo:
            print(f"[Recordatorios] Cita {cita.id_cita} omitida: Paciente o correo inválido/inexistente.")
            continue

        nombre_paciente = f"{paciente.nombres} {paciente.apellidos}"
        nombre_vacuna = cita.campana.nombre_campaña if cita.campana else "Campaña de Vacunación"
        centro_nombre = cita.centro_vacunacion.nombre_centro if cita.centro_vacunacion else "Centro de Vacunación"
        centro_direccion = cita.centro_vacunacion.obtener_direccion_completa_centro() if cita.centro_vacunacion else "Dirección no registrada"

        try:
            enviar_recordatorio_cita(
                email_destino=paciente.correo,
                nombre_paciente=nombre_paciente,
                nombre_vacuna=nombre_vacuna,
                cita_fecha=str(cita.fecha_cita),
                cita_hora=str(cita.hora_cita),
                centro_nombre=centro_nombre,
                centro_direccion=centro_direccion
            )
            # Si se envió con éxito, actualizamos el estado
            cita.recordatorio_enviado = True
            cita.save()
            print(f"[Recordatorios] [OK] Recordatorio enviado exitosamente a {paciente.correo} para la cita {cita.id_cita}.")
        except Exception as e:
            # Si falla, incrementamos intentos y registramos fecha del último intento
            cita.intentos_recordatorio += 1
            cita.ultimo_intento_recordatorio = ahora
            cita.save()
            print(f"[Recordatorios] [ERROR] Fallo intento {cita.intentos_recordatorio}/3 para la cita {cita.id_cita}. Error: {e}")