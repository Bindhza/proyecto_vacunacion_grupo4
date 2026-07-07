import os
import django
import sys
from django.utils import timezone
from datetime import timedelta

# Configurar el entorno de Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vacunacion.settings")
django.setup()

from vacunacion.mails import enviar_correo_confirmacion, enviar_post_vacunacion, enviar_recordatorio_cita

def test_confirmacion(email_destino):
    try:
        print("\n1. Enviando correo de confirmación de cita...")
        enviar_correo_confirmacion(
            email_destino=email_destino,
            nombre_paciente="Juan Pérez",
            nombre_vacuna="Pfizer-BioNTech",
            cita_fecha="2026-07-07",
            cita_hora="10:30",
            centro_nombre="Centro de Vacunación Metropolitana",
            centro_direccion="Avenida Providencia 1234, Santiago"
        )
        print("[OK] Correo de confirmación enviado exitosamente.")
    except Exception as e:
        print(f"[ERROR] Al enviar el correo de confirmación: {e}")
        import traceback
        traceback.print_exc()

def test_post_vacunacion(email_destino):
    try:
        print("\n2. Enviando correo post-vacunación...")
        enviar_post_vacunacion(
            email_destino=email_destino,
            nombre_paciente="Juan Pérez",
            nombre_vacuna="Pfizer-BioNTech",
            cita_fecha="2026-07-06",
            nombre_centro="Centro de Vacunación Metropolitana"
        )
        print("[OK] Correo post-vacunación enviado exitosamente.")
    except Exception as e:
        print(f"[ERROR] Al enviar el correo post-vacunación: {e}")
        import traceback
        traceback.print_exc()

def test_recordatorio(email_destino):
    try:
        print("\n3. Enviando correo de recordatorio (1 día antes)...")
        enviar_recordatorio_cita(
            email_destino=email_destino,
            nombre_paciente="Juan Pérez",
            nombre_vacuna="Pfizer-BioNTech",
            cita_fecha="2026-07-07",
            cita_hora="10:30",
            centro_nombre="Centro de Vacunación Metropolitana",
            centro_direccion="Avenida Providencia 1234, Santiago"
        )
        print("[OK] Correo de recordatorio enviado exitosamente.")
    except Exception as e:
        print(f"[ERROR] Al enviar el correo de recordatorio: {e}")
        import traceback
        traceback.print_exc()

def simular_reintentos(email_destino):
    print("\n" + "=" * 60)
    print(" SIMULACIÓN DE MÁQUINA DE ESTADOS Y POLÍTICA DE REINTENTOS ")
    print("=" * 60)
    
    # 1. Crear un objeto mock que simule una Cita
    from unittest.mock import MagicMock
    
    mock_paciente = MagicMock()
    mock_paciente.correo = email_destino
    mock_paciente.nombres = "Juan"
    mock_paciente.apellidos = "Pérez"
    
    mock_cita = MagicMock()
    mock_cita.id_cita = 9999
    mock_cita.fecha_cita = timezone.now().date() + timedelta(days=1)
    mock_cita.hora_cita = "12:00"
    mock_cita.paciente_citado = mock_paciente
    mock_cita.campana.nombre_campaña = "Vacuna de Prueba"
    mock_cita.centro_vacunacion.nombre_centro = "Centro de Prueba"
    mock_cita.centro_vacunacion.obtener_direccion_completa_centro.return_value = "Dirección de Prueba 123"
    
    # Estados de control iniciales de la simulación
    mock_cita.recordatorio_enviado = False
    mock_cita.intentos_recordatorio = 0
    mock_cita.ultimo_intento_recordatorio = None
    
    # Lógica que simula el filtrado y flujo de enviar_recordatorios_pendientes
    def procesar_cita(cita, forzar_envio_exitoso=True):
        ahora = timezone.now()
        
        # Validación 1: Ya enviado
        if cita.recordatorio_enviado:
            print(f"-> Cita {cita.id_cita}: Ya enviada anteriormente. Omitiendo.")
            return False
            
        # Validación 2: Máximo de 3 intentos
        if cita.intentos_recordatorio >= 3:
            print(f"-> Cita {cita.id_cita}: Ya alcanzó el máximo de 3 intentos. Deteniendo.")
            return False
            
        # Validación 3: Espera de 1 hora
        if cita.ultimo_intento_recordatorio:
            diferencia = ahora - cita.ultimo_intento_recordatorio
            if diferencia < timedelta(hours=1):
                tiempo_restante = timedelta(hours=1) - diferencia
                minutos_pasados = diferencia.seconds // 60
                minutos_restantes = tiempo_restante.seconds // 60
                print(f"-> Cita {cita.id_cita}: Omitiendo. Último intento hace {minutos_pasados} min. Debe esperar {minutos_restantes} min más (1 hora).")
                return False
        
        print(f"-> Cita {cita.id_cita}: Intentando envío (Intento {cita.intentos_recordatorio + 1}/3)...")
        if forzar_envio_exitoso:
            try:
                enviar_recordatorio_cita(
                    email_destino=cita.paciente_citado.correo,
                    nombre_paciente=f"{cita.paciente_citado.nombres} {cita.paciente_citado.apellidos}",
                    nombre_vacuna=cita.campana.nombre_campaña,
                    cita_fecha=str(cita.fecha_cita),
                    cita_hora=str(cita.hora_cita),
                    centro_nombre=cita.centro_vacunacion.nombre_centro,
                    centro_direccion=cita.centro_vacunacion.obtener_direccion_completa_centro()
                )
                cita.recordatorio_enviado = True
                print(f"[OK] ¡Intento exitoso! recordatorio_enviado establecido en True.")
                return True
            except Exception as ex:
                cita.intentos_recordatorio += 1
                cita.ultimo_intento_recordatorio = ahora
                print(f"[ERROR] En envío: {ex}. Registrando intento {cita.intentos_recordatorio}/3.")
                return False
        else:
            # Simular fallo controlado (ej. caída de red o API no válida)
            cita.intentos_recordatorio += 1
            cita.ultimo_intento_recordatorio = ahora
            print(f"[ERROR] ¡Intento fallido! (Simulación de error de red). Registrando intento {cita.intentos_recordatorio}/3.")
            return False

    print("\n--- PASO 1: Simulación de fallo en el primer envío ---")
    procesar_cita(mock_cita, forzar_envio_exitoso=False)
    print(f"Estado de la cita: intentos={mock_cita.intentos_recordatorio}, ultimo_intento={mock_cita.ultimo_intento_recordatorio}, enviado={mock_cita.recordatorio_enviado}")
    
    print("\n--- PASO 2: Intentar enviar de inmediato (Debe rebotar por regla de 1 hora de espera) ---")
    procesar_cita(mock_cita, forzar_envio_exitoso=True)
    
    print("\n--- PASO 3: Simular paso del tiempo (+61 minutos) y reintentar con fallo ---")
    # Adelantamos artificialmente el último intento simulando que ocurrió hace 61 minutos
    mock_cita.ultimo_intento_recordatorio = timezone.now() - timedelta(minutes=61)
    procesar_cita(mock_cita, forzar_envio_exitoso=False)
    print(f"Estado de la cita: intentos={mock_cita.intentos_recordatorio}, enviado={mock_cita.recordatorio_enviado}")
    
    print("\n--- PASO 4: Simular paso del tiempo (+61 minutos) y reintentar con fallo (Llegando a Intento 3/3) ---")
    mock_cita.ultimo_intento_recordatorio = timezone.now() - timedelta(minutes=61)
    procesar_cita(mock_cita, forzar_envio_exitoso=False)
    print(f"Estado de la cita: intentos={mock_cita.intentos_recordatorio}, enviado={mock_cita.recordatorio_enviado}")
    
    print("\n--- PASO 5: Intentar enviar de nuevo tras superar el límite de 3 intentos (Debe bloquearse) ---")
    mock_cita.ultimo_intento_recordatorio = timezone.now() - timedelta(minutes=61)
    procesar_cita(mock_cita, forzar_envio_exitoso=True)
    print(f"Estado final de la cita: intentos={mock_cita.intentos_recordatorio}, enviado={mock_cita.recordatorio_enviado}")
    print("=" * 60)

def main():
    print("=" * 60)
    print(" PRUEBA INTERACTIVA DE CORREOS - VACUNAPP ")
    print("=" * 60)
    
    try:
        email_destino = input("Introduce tu correo electrónico para las pruebas: ").strip()
    except KeyboardInterrupt:
        print("\nPrueba cancelada.")
        sys.exit(0)
        
    if not email_destino or "@" not in email_destino:
        print("Error: Correo electrónico inválido.")
        sys.exit(1)
        
    while True:
        print("\nSelecciona qué deseas probar:")
        print("1. Enviar correo de Confirmación de Cita")
        print("2. Enviar correo Post-Vacunación")
        print("3. Enviar correo de Recordatorio (1 día antes)")
        print("4. Ejecutar simulación de Reintentos y Máquina de Estados (APScheduler)")
        print("5. Probar todos los correos anteriores (1, 2 y 3)")
        print("0. Salir")
        
        try:
            opcion = input("Opción: ").strip()
        except KeyboardInterrupt:
            print("\nSaliendo...")
            break
            
        if opcion == "1":
            test_confirmacion(email_destino)
        elif opcion == "2":
            test_post_vacunacion(email_destino)
        elif opcion == "3":
            test_recordatorio(email_destino)
        elif opcion == "4":
            simular_reintentos(email_destino)
        elif opcion == "5":
            test_confirmacion(email_destino)
            test_post_vacunacion(email_destino)
            test_recordatorio(email_destino)
        elif opcion == "0":
            print("Saliendo de las pruebas.")
            break
        else:
            print("Opción no válida. Intenta de nuevo.")

if __name__ == "__main__":
    main()
