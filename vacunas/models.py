from django.db import models

# Create your models here.
class Vacunacion(models.Model):

    id_vacunacion = models.IntegerField(unique=True, primary_key=True)
    fecha_vacunacion = models.DateField()
    observaciones = models.CharField(max_length=100)
    vacuna_aplicada = models.ForeignKey('Vacuna', on_delete=models.SET_NULL, null=True)
    centro_vacunacion = models.ForeignKey('campana_vacunacion.CentroVacunacion', on_delete=models.SET_NULL, null=True)

class VacunacionPorCampaña(models.Model):
    id_vacunacion = models.ForeignKey('Vacunacion', on_delete=models.SET_NULL, null=True)
    id_campaña = models.ForeignKey('campana_vacunacion.Campaña', on_delete=models.SET_NULL, null=True)

class Vacuna(models.Model):

    id_vacuna = models.IntegerField(unique=True, primary_key=True)
    stock_disponible = models.IntegerField(unique=True)
    nombre_vacuna = models.CharField(max_length=100)

class UsuarioRecibioVacuna(models.Model):
    id_usuario = models.ForeignKey('manejo_usuarios.Usuario', on_delete=models.CASCADE)
    id_vacunacion = models.ForeignKey('Vacunacion', on_delete=models.SET_NULL, null=True)
