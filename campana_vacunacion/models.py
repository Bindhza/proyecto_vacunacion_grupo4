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

    # Retorna solo los centros que tienen al menos una cita disponible para esta campaña
    def obtener_centros_disponibles(self):
        return CentroVacunacion.objects.filter(
            cita__campana=self, 
            cita__estado_cita=True
        ).distinct()

    def verificar_horarios_y_cupos(self, centro):
        # Busca citas disponibles para esta campaña y centro
        return Cita.objects.filter(
            campana=self, # Filtramos aquellas citas pertenecientes a la campaña
            centro_vacunacion=centro,
            estado_cita=True # Asumimos True como disponible 
        )

    #Recibimos la fecha y hora de la consulta y filtramos las citas disponibles
    def verificar_disponibilidad_horario(self, centro, fecha, hora):
        return Cita.objects.filter(
            campana=self,
            centro_vacunacion=centro,
            fecha_cita=fecha,
            hora_cita=hora,
            estado_cita=True
        ).exists()

    #Encontramos una cita disponible y la asociamos a un paciente
    def agendar_cita(self, paciente, centro, fecha, hora):
        cita_disponible = Cita.objects.filter(
            campana=self,
            centro_vacunacion=centro,
            fecha_cita=fecha,
            hora_cita=hora,
            estado_cita=True
        ).first()

        if cita_disponible:
            # Si la cita esta disponible, llamamos al metodo de Cita responsable de agendar
            exito = cita_disponible.agendar(paciente)
            if exito:
                return True, cita_disponible
        return False, None


class Cita(models.Model):

    id_cita = models.IntegerField(unique=True, primary_key=True)
    fecha_cita = models.DateField()
    hora_cita = models.TimeField()
    centro_vacunacion = models.ForeignKey('CentroVacunacion', on_delete=models.SET_NULL, null=True)
    estado_cita = models.BooleanField()
    campana = models.ForeignKey('Campaña', on_delete=models.SET_NULL, null=True)
    paciente_citado = models.ForeignKey('manejo_usuarios.Paciente', on_delete=models.SET_NULL, null=True)
    personal_citado = models.ForeignKey('manejo_usuarios.Personal', on_delete=models.SET_NULL, null=True)

    def esta_disponible(self):
        # Comprobamos la disponibilidad de la cita, si su estado es True y no tiene un paciente asignado entonces esta disponible
        return self.estado_cita and self.paciente_citado is None

    def agendar(self, paciente):
        # Reserva la cita para el paciente si está disponible
        if self.esta_disponible():
            self.estado_cita = False
            self.paciente_citado = paciente
            self.save()
            return True
        return False
    # En caso de ser necesario cancelar una cita, liberamos la cita para una posterior asignacion
    def cancelar(self):
        self.estado_cita = True
        self.paciente_citado = None
        self.save()
        return True

    def asignar_personal(self, personal):
        self.personal_citado = personal
        self.save()
        return True

    def eliminar_personal(self):
        self.personal_citado = None
        self.save()
        return True

class CentroVacunacion(models.Model):
    id_centro = models.IntegerField(unique=True, primary_key=True)
    nombre_centro = models.CharField(max_length=100)
    direccion_centro = models.ForeignKey('Direccion', on_delete=models.SET_NULL, null=True)
    comuna_centro = models.CharField(max_length=100)
    region_centro = models.CharField(max_length=100)

    # Retorna el nombre del centro
    def __str__(self):
        return self.nombre_centro

    def obtener_direccion_completa_centro(self):
        if self.direccion_centro:
            return f"{self.direccion_centro.obtener_direccion_completa()}, Comuna: ({self.comuna_centro}, Región: {self.region_centro})"
        return "Dirección no registrada"


    # Busca todas las citas disponibles para este centro
    def obtener_citas_disponibles(self, campana=None):
        
        citas = Cita.objects.filter(centro_vacunacion=self, estado_cita=True)
        if campana:
            citas = citas.filter(campana=campana)
        return citas

    # Retorna True si hay al menos una cita disponible
    def tiene_disponibilidad(self, campana=None):  
        return self.obtener_citas_disponibles(campana).exists()



class Direccion(models.Model):
    ciudad = models.CharField(max_length=100)
    calle = models.CharField(max_length=100)
    numero = models.IntegerField()
    #Serie de getters para obtener los datos de la dirección y usarlos cuando sea pertinente
    def get_ciudad(self):
        return self.ciudad

    def get_calle(self):
        return self.calle

    def get_numero(self):
        return self.numero

    def obtener_direccion_completa(self):
        return f"{self.get_calle()} {self.get_numero()}, {self.get_ciudad()}"

    def __str__(self):
        return self.obtener_direccion_completa()