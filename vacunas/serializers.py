from django.db import transaction
from rest_framework import serializers
from .models import *
from manejo_usuarios.models import Usuario
from campana_vacunacion.models import Campaña, CentroVacunacion

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

class FormularioVacunacionSerializer(serializers.Serializer):
    id_vacunacion = serializers.IntegerField(required=True)
    id_usuario = serializers.CharField(max_length=12, required=True)
    fecha_vacunacion = serializers.DateField(required=True)
    observaciones = serializers.CharField(max_length=100, required=False, allow_blank=True)
    vacuna_aplicada = serializers.IntegerField(required=True)
    centro_vacunacion = serializers.IntegerField(required=False, allow_null=True)
    id_campaña = serializers.IntegerField(required=False, allow_null=True)

    def create(self, validated_data):

        #extraer los datos del formulario enviado por el frontend
        id_vacunacion = validated_data.get('id_vacunacion')
        id_usuario = validated_data.get('id_usuario')
        fecha_vacunacion = validated_data.get('fecha_vacunacion')
        observaciones = validated_data.get('observaciones')
        vacuna_aplicada = validated_data.get('vacuna_aplicada')
        centro_vacunacion = validated_data.get('centro_vacunacion')
        id_campaña = validated_data.get('id_campaña')

        #crear transaccion para asegurar que todas las operaciones se realicen correctamente
        #si una operacion falla, se revierten todo
        with transaction.atomic():

            #crear vacunacion
            vacunacion = Vacunacion.objects.create(
                id_vacunacion=id_vacunacion,
                fecha_vacunacion=fecha_vacunacion,
                observaciones=observaciones,
                vacuna_aplicada_id=vacuna_aplicada,
                centro_vacunacion_id=centro_vacunacion
            )

            #crear usuario recibio vacuna
            UsuarioRecibioVacuna.objects.create(
                id_usuario_id=id_usuario,
                id_vacunacion=vacunacion
            )

            #crear vacunacion por campaña

            if id_campaña:
                VacunacionPorCampaña.objects.create(
                    id_vacunacion=vacunacion,
                    id_campaña_id=id_campaña
                )

        return vacunacion
        
    

