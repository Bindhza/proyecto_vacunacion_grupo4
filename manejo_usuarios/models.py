from datetime import date
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

#Clase manager general para indicar al sistema como crear usuarios y superusuarios
class UsuarioManager(BaseUserManager):
    def create_user(self, rut, correo, nombres, apellidos, fecha_nacimiento, password=None, **extra_fields):
        if not rut:
            raise ValueError('El usuario debe tener un RUT')

        correo = self.normalize_email(correo)

        user = self.model(
            rut=rut, 
            correo=correo, 
            nombres=nombres, 
            apellidos=apellidos, 
            fecha_nacimiento=fecha_nacimiento, 
            **extra_fields
        )
        
        # Encripta la contraseña para mayor seguridad
        user.set_password(password)
        
        # Guarda el usuario en la base de datos
        user.save(using=self._db)
        return user

    #Clase para crear superusuario (admin) 
    def create_superuser(self, rut, correo, nombres, apellidos, fecha_nacimiento, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        return self.create_user(rut, correo, nombres, apellidos, fecha_nacimiento, password, **extra_fields)

#Clase usuario de las cuales heredan las clases Paciente, Personal y Admin

class Usuario(AbstractBaseUser, PermissionsMixin):
    rut = models.CharField(unique=True, primary_key=True, max_length=12) 
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    fecha_nacimiento = models.DateField()
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UsuarioManager()

    USERNAME_FIELD = 'rut'
    REQUIRED_FIELDS = ['correo', 'nombres', 'apellidos', 'fecha_nacimiento']

    def __str__(self):
        return f"{self.rut} - {self.nombres} {self.apellidos}"

    # Propiedad que permite calcular la edad a partir de la fecha de nacimiento
    @property
    def obtener_edad(self):
        if not self.fecha_nacimiento:
            return 0
        hoy = date.today()
        return hoy.year - self.fecha_nacimiento.year - ((hoy.month, hoy.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day))
    
    #Propiedad para verificar el tipo de usuario
    @property
    def es_paciente(self):
        return hasattr(self, 'paciente')

    @property
    def es_personal(self):
        return hasattr(self, 'personal')

    @property
    def es_admin(self):
        return hasattr(self, 'admin')

    def obtener_historial(self):
        return self.historial_set.all().order_by('fecha', 'hora')

    @property
    def dosis_recibidas(self):
        """Devuelve una lista con instancias de historial asociadas al usuario."""
        return list(self.historial_set.all().select_related('vacuna'))


class Paciente(Usuario):
    telefono = models.IntegerField()

class Personal(Usuario):
    id_personal = models.IntegerField(unique=True)
    centro_vacunacion = models.ForeignKey('campana_vacunacion.CentroVacunacion', on_delete=models.SET_NULL, null=True)

    #Registra una dosis y calcula el numero de dosis recibida
    def registrar_vacuna(self, usuario_receptor, vacuna_aplicada):
        dosis_previas = Historial.objects.filter(
            usuario=usuario_receptor, 
            vacuna=vacuna_aplicada
        ).count()
        
        nueva_dosis = dosis_previas + 1
        
        nuevo_registro = Historial.objects.create(
            usuario=usuario_receptor,
            vacuna=vacuna_aplicada,
            personal_a_cargo=self,
            dosis=nueva_dosis
        )
        return nuevo_registro

class Admin(Usuario):
    pass

class Historial(models.Model):
    # Usuario que se vacuno
    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE) 
    
    # Que vacuna se aplicó
    vacuna = models.ForeignKey('vacunas.Vacuna', on_delete=models.PROTECT) 
    
    # Que personal aplicó la vacuna
    personal_a_cargo = models.ForeignKey('Personal', on_delete=models.SET_NULL, null=True) 
    
    # Guardamos fecha y hora exacta en que se crea el registro
    fecha = models.DateField(auto_now_add=True)
    hora = models.TimeField(auto_now_add=True)
    # Numero de dosis recibida
    dosis = models.IntegerField()

