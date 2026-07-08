from rest_framework import serializers
from .models import CentroVacunacion, Campaña

class CentroVacunacionSerializer(serializers.ModelSerializer):
    calle = serializers.SerializerMethodField()
    numero = serializers.SerializerMethodField()
    ciudad = serializers.SerializerMethodField()
    direccion_completa = serializers.SerializerMethodField()

    class Meta:
        model = CentroVacunacion
        fields = '__all__'

    def get_calle(self, obj):
        return obj.direccion_centro.calle if obj.direccion_centro else ""

    def get_numero(self, obj):
        return obj.direccion_centro.numero if obj.direccion_centro else ""

    def get_ciudad(self, obj):
        return obj.direccion_centro.ciudad if obj.direccion_centro else ""

    def get_direccion_completa(self, obj):
        return obj.obtener_direccion_completa_centro()

class CampañaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaña
        fields = '__all__'