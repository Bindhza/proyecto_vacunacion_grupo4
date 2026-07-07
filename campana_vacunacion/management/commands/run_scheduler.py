import sys
from django.core.management.base import BaseCommand
from apscheduler.schedulers.blocking import BlockingScheduler
from vacunacion.mails import enviar_recordatorios_pendientes

class Command(BaseCommand):
    help = "Inicia el planificador periódico para enviar recordatorios de citas"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Iniciando planificador de recordatorios (APScheduler)..."))
        
        scheduler = BlockingScheduler()
        
        # Ejecuta la tarea cada 10 minutos
        scheduler.add_job(
            enviar_recordatorios_pendientes,
            'interval',
            minutes=10,
            id='enviar_recordatorios_job',
            replace_existing=True
        )
        
        # También la corremos inmediatamente al iniciar para procesar pendientes de inmediato
        self.stdout.write(self.style.WARNING("Ejecutando primera comprobación inmediata..."))
        try:
            enviar_recordatorios_pendientes()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error en ejecución inicial: {e}"))
            
        try:
            self.stdout.write(self.style.SUCCESS("APScheduler iniciado. Presione Ctrl+C para salir."))
            scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            self.stdout.write(self.style.SUCCESS("Planificador detenido con éxito."))
