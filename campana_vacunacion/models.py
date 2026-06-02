from django.db import models

# Create your models here.

class Campaña(models.Model):
    id_campaña = models.IntegerField(unique=True, primary_key=True)
    nombre_campaña = models.CharField(max_length=100)
    descripcion_campaña = models.CharField(max_length=100)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado_campaña = models.BooleanField()

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
    