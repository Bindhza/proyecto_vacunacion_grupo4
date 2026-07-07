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
        "paciente_nombre": nombre_paciente,
        "vacuna_nombre": nombre_vacuna,
        "fecha_cita": cita_fecha,
        "hora_cita": cita_hora,
        "centro_nombre": centro_nombre,
        "centro_direccion": centro_direccion,
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
        "paciente_nombre": nombre_paciente,
        "vacuna_nombre": nombre_vacuna,
        "cita_fecha": cita_fecha,
        "centro_nombre": nombre_centro,
    }
    
    # 1. Renderiza el HTML con los datos dinámicos
    html_content = render_to_string("mails/post_vacunacion.html", context)
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