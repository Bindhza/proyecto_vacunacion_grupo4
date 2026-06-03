from django.db import models
from datetime import date

# Create your models here.

class Campaña(models.Model):
    id_campaña = models.IntegerField(unique=True, primary_key=True)
    nombre_campaña = models.CharField(max_length=100)
    descripcion_campaña = models.CharField(max_length=100)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado_campaña = models.BooleanField()

    # Obtenemos la fecha de hoy, la comparamos con las fechas de inicio y fin y analizamos el estado de la campaña
    def verificar_vigencia(self):
        hoy = date.today()
        if self.estado_campaña and self.fecha_inicio <= hoy <= self.fecha_fin:
            return True
        return False


    def obtener_centros_disponibles(self):
        # Retorna los centros disponibles. Por ahora retorna todos (COMPLETAR CUANDO SE IMPLEMENTE LA CLASE CENTRO)
        return CentroVacunacion.objects.all()

    def verificar_horarios_y_cupos(self, centro):
        # Busca citas disponibles para esta campaña y centro (usando nombre_centro por ahora)
        return Cita.objects.filter(
            cita=self, # Filtramos aquellas citas pertenecientes a la campaña
            ubicacion_cita=centro.nombre_centro,
            estado_cita=True # Asumimos True como disponible 
        )

        #Recibimos la fecha y hora de la consulta y filtramos las citas disponibles
    def verificar_disponibilidad_horario(self, centro, fecha, hora):
        return Cita.objects.filter(
            cita=self,
            ubicacion_cita=centro.nombre_centro,
            fecha_cita=fecha,
            hora_cita=hora,
            estado_cita=True
        ).exists()

    #Encontramos una cita disponible y la asociamos a un paciente
    def agendar_cita(self, paciente, centro, fecha, hora):
        cita_disponible = Cita.objects.filter(
            cita=self,
            ubicacion_cita=centro.nombre_centro,
            fecha_cita=fecha,
            hora_cita=hora,
            estado_cita=True
        ).first()

        if cita_disponible:
            cita_disponible.estado_cita = False # Marcamos como reservada
            cita_disponible.paciente_citado = paciente
            cita_disponible.save()
            return True, cita_disponible
        return False, None


class Cita(models.Model):

    id_cita = models.IntegerField(unique=True, primary_key=True)
    fecha_cita = models.DateField()
    hora_cita = models.TimeField()
    ubicacion_cita = models.CharField(max_length=100)
    estado_cita = models.BooleanField()
    cita = models.ForeignKey('Campaña', on_delete=models.SET_NULL, null=True)
    paciente_citado = models.ForeignKey('manejo_usuarios.Paciente', on_delete=models.SET_NULL, null=True)
    personal_citado = models.ForeignKey('PersonalCita', on_delete=models.SET_NULL, null=True, related_name='citas_del_personal')

class PersonalCita(models.Model):
    personal_citado = models.ForeignKey('manejo_usuarios.Personal', on_delete=models.SET_NULL, null=True)
    cita = models.ForeignKey('Cita', on_delete=models.SET_NULL, null=True)
    
class CentroVacunacion(models.Model):
    id_centro = models.IntegerField(unique=True, primary_key=True)
    nombre_centro = models.CharField(max_length=100)
    direccion_centro = models.ForeignKey('Direccion', on_delete=models.SET_NULL, null=True)
    comuna_centro = models.CharField(max_length=100)
    region_centro = models.CharField(max_length=100)

class Direccion(models.Model):
    ciudad = models.CharField(max_length=100)
    calle = models.CharField(max_length=100)
    numero = models.IntegerField()
    