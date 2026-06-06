from rest_framework import serializers
from .models import CentroVacunacion, Campaña

class CentroVacunacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CentroVacunacion
        fields = '__all__'

class CampañaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaña
        fields = '__all__'