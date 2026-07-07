import os
import django
import sys

# Configurar el entorno de Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vacunacion.settings")
django.setup()

from vacunacion.mails import enviar_correo_confirmacion, enviar_post_vacunacion

def main():
    print("=" * 60)
    print(" PRUEBA DE ENVÍO DE CORREOS - VACUNAPP ")
    print("=" * 60)
    
    # Solicitar el correo electrónico al usuario
    try:
        email_destino = input("Introduce tu correo electrónico para recibir los mails de prueba: ").strip()
    except KeyboardInterrupt:
        print("\nPrueba cancelada.")
        sys.exit(0)
        
    if not email_destino or "@" not in email_destino:
        print("Error: Correo electrónico inválido.")
        sys.exit(1)
        
    print(f"\nPreparando envío a: {email_destino}...\n")
    
    # 1. Probar enviar_correo_confirmacion
    try:
        print("1. Enviando correo de confirmación de cita...")
        enviar_correo_confirmacion(
            email_destino=email_destino,
            nombre_paciente="Juan Pérez",
            nombre_vacuna="Pfizer-BioNTech",
            cita_fecha="2026-07-07",
            cita_hora="10:30",
            centro_nombre="Centro de Vacunación Metropolitana",
            centro_direccion="Avenida Providencia 1234, Santiago"
        )
        print("✅ Correo de confirmación enviado exitosamente.")
    except Exception as e:
        print(f"❌ Error al enviar el correo de confirmación: {e}")
        import traceback
        traceback.print_exc()

    print("-" * 60)

    # 2. Probar enviar_post_vacunacion
    try:
        print("2. Enviando correo post-vacunación...")
        enviar_post_vacunacion(
            email_destino=email_destino,
            nombre_paciente="Juan Pérez",
            nombre_vacuna="Pfizer-BioNTech",
            cita_fecha="2026-07-06",
            nombre_centro="Centro de Vacunación Metropolitana"
        )
        print("✅ Correo post-vacunación enviado exitosamente.")
    except Exception as e:
        print(f"❌ Error al enviar el correo post-vacunación: {e}")
        import traceback
        traceback.print_exc()
        
    print("=" * 60)
    print("Proceso finalizado. Por favor, revisa tu bandeja de entrada.")
    print("=" * 60)

if __name__ == "__main__":
    main()
