from django.db import models

# Create your models here.
class Usuario(models.Model):
    #se usa un charfield para el rut porque puede tener k
    rut = models.CharField(unique=True, primary_key=True, max_length=9) 
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    fecha_nacimiento = models.DateField()
    
class Paciente(Usuario):

    telefono = models.IntegerField()

class Personal(Usuario):

    id_personal = models.IntegerField(unique=True)
    centro_vacunacion = models.ForeignKey('campana_vacunacion.CentroVacunacion', on_delete=models.SET_NULL, null=True)

class Admin(Usuario):
    pass
    
    
class Historial(models.Model):
    
    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE)
    fecha = models.DateField()
    hora = models.TimeField()
    dosis = models.IntegerField()


