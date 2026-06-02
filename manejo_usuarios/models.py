from django.db import models

# Create your models here.
class Usuario(models.Model):

    rut = models.CharField(unique=True, primary_key=True, max_length=9) #se usa un charfield para el rut porque puede tener k
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    fecha_nacimiento = models.DateField()
    
class Paciente(models.Model):

    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE)
    telefono = models.IntegerField()

class Personal(models.Model):

    id_personal = models.IntegerField(unique=True, primary_key=True)
    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE)
    centro_vacunacion = models.ForeignKey('campana_vacunacion.CentroVacunacion', on_delete=models.SET_NULL, null=True)

class Admin(models.Model):
    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE)
    

class Historial(models.Model):
    
    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE)
    fecha = models.DateField()
    hora = models.TimeField()
    dosis = models.IntegerField()


