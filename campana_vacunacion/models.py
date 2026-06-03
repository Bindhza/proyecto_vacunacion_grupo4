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
            # Si la cita esta disponible, llamamos al metodo de Cita responsable de agendar
            exito = cita_disponible.agendar(paciente)
            if exito:
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
    #En caso de ser necesario cancelar una cita, liberamos la cita para una posterior asignacion
    def cancelar(self):
        self.estado_cita = True
        self.paciente_citado = None
        self.save()
        return True


class PersonalCita(models.Model):
    personal_citado = models.ForeignKey('manejo_usuarios.Personal', on_delete=models.SET_NULL, null=True)
    cita = models.ForeignKey('Cita', on_delete=models.SET_NULL, null=True)

    @classmethod
    def asignar_personal(cls, personal, cita):
        # Creamos o actualizamos el registro que vincula al personal con la cita
        registro, creado = cls.objects.get_or_create(cita=cita)
        registro.personal_citado = personal
        registro.save()
        
        # Actualizamos la cita para reflejar este registro (manteniendo consistencia)
        cita.personal_citado = registro
        cita.save()
        
        return registro

    @classmethod
    def eliminar_personal(cls, cita):
        # Buscamos si existe un registro de personal para esta cita
        registro = cls.objects.filter(cita=cita).first()
        if registro:
            # Eliminamos el registro de asignación
            registro.delete()
            
            # Limpiamos la referencia en la cita
            cita.personal_citado = None
            cita.save()
            return True
        return False

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
    