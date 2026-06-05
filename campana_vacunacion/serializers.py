from rest_framework import serializers
from .models import CentroVacunacion

class CentroVacunacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CentroVacunacion
        fields = '__all__'