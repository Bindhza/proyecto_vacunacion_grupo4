from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UsuarioManager(BaseUserManager):
    """
    Manager personalizado para el modelo Usuario.
    Le indica a Django cómo debe crear los usuarios normales y los superusuarios
    usando el RUT en lugar de un nombre de usuario tradicional.
    """
    
    def create_user(self, rut, correo, nombres, apellidos, fecha_nacimiento, password=None, **extra_fields):
        """
        Crea y guarda un usuario regular con el RUT, correo y contraseña dados.
        ⚠️ Importante: El nombre del método DEBE ser 'create_user' en inglés 
        para que los sistemas internos de Django funcionen correctamente.
        """
        if not rut:
            raise ValueError('El usuario debe tener un RUT')
        
        # Formatea el correo (pasa el dominio a minúsculas, etc.)
        correo = self.normalize_email(correo)
        
        # Crea la instancia del modelo en memoria
        user = self.model(
            rut=rut, 
            correo=correo, 
            nombres=nombres, 
            apellidos=apellidos, 
            fecha_nacimiento=fecha_nacimiento, 
            **extra_fields
        )
        
        # Encripta la contraseña de forma segura (NUNCA guardar en texto plano)
        user.set_password(password)
        
        # Guarda el usuario en la base de datos
        user.save(using=self._db)
        return user

    def create_superuser(self, rut, correo, nombres, apellidos, fecha_nacimiento, password=None, **extra_fields):
        """
        Crea y guarda un Superusuario (Administrador total) con el RUT dado.
        ⚠️ Importante: El nombre del método DEBE ser 'create_superuser' para que 
        el comando 'python manage.py createsuperuser' de la consola no falle.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        return self.create_user(rut, correo, nombres, apellidos, fecha_nacimiento, password, **extra_fields)

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

class Paciente(Usuario):
    telefono = models.IntegerField()

class Personal(Usuario):
    id_personal = models.IntegerField(unique=True)
    centro_vacunacion = models.ForeignKey('campana_vacunacion.CentroVacunacion', on_delete=models.SET_NULL, null=True)

class Admin(Usuario):
    pass
    
class Historial(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    fecha = models.DateField()
    hora = models.TimeField()
    dosis = models.IntegerField()
