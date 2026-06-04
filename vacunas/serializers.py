from rest_framework import serializers
from .models import *

class VacunaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vacuna
        fields = ['id_vacuna', 'nombre_vacuna', 'stock_disponible']

class VacunacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vacunacion
        fields = ['id_vacunacion', 'fecha_vacunacion', 'observaciones', 'vacuna_aplicada', 'centro_vacunacion' ]

class UsuarioRecibioVacunaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioRecibioVacuna
        fields = ['id_usuario', 'id_vacunacion']

class VacunacionPorCampañaSerializer(serializers.ModelSerializer):
    class Meta:
        model = VacunacionPorCampaña
        fields = ['id_vacunacion', 'id_campaña']

