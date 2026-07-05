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
        fields = ['id_vacunacion', 'fecha_vacunacion', 'hora_vacunacion', 'observaciones', 'campana', 'centro_vacunacion' ]

class UsuarioRecibioVacunaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioRecibioVacuna
        fields = ['id_usuario', 'id_vacunacion']

class VacunacionPorCampañaSerializer(serializers.ModelSerializer):
    class Meta:
        model = VacunacionPorCampaña
        fields = ['id_vacunacion', 'id_campaña']

class FormularioVacunacionSerializer(serializers.Serializer):
    id_vacunacion = serializers.IntegerField(required=False, allow_null=True)
    id_usuario = serializers.CharField(max_length=12, required=True)
    fecha_vacunacion = serializers.DateField(required=True)
    hora_vacunacion = serializers.TimeField(required=True)
    observaciones = serializers.CharField(max_length=100, required=False, allow_blank=True)
    campana = serializers.IntegerField(required=True)
    centro_vacunacion = serializers.IntegerField(required=False, allow_null=True)

    def create(self, validated_data):
        from django.db.models import Max

        id_usuario = validated_data.get('id_usuario')
        fecha_vacunacion = validated_data.get('fecha_vacunacion')
        hora_vacunacion = validated_data.get('hora_vacunacion')
        observaciones = validated_data.get('observaciones', '')
        if observaciones is None:
            observaciones = ''
        campana_id = validated_data.get('campana')
        centro_vacunacion = validated_data.get('centro_vacunacion')

        with transaction.atomic():
            max_id = Vacunacion.objects.aggregate(Max('id_vacunacion'))['id_vacunacion__max'] or 0
            new_id = max_id + 1

            vacunacion = Vacunacion.objects.create(
                id_vacunacion=new_id,
                fecha_vacunacion=fecha_vacunacion,
                hora_vacunacion=hora_vacunacion,
                observaciones=observaciones,
                campana_id=campana_id,
                centro_vacunacion_id=centro_vacunacion
            )

            UsuarioRecibioVacuna.objects.create(
                id_usuario_id=id_usuario,
                id_vacunacion=vacunacion
            )

            VacunacionPorCampaña.objects.create(
                id_vacunacion=vacunacion,
                id_campaña_id=campana_id
            )

            from manejo_usuarios.models import Historial, Usuario
            try:
                usuario = Usuario.objects.get(rut=id_usuario)
                dosis_previas = Historial.objects.filter(usuario=usuario, campana_id=campana_id).count()
                Historial.objects.create(
                    usuario=usuario,
                    campana_id=campana_id,
                    centro_vacunacion_id=centro_vacunacion,
                    fecha=fecha_vacunacion,
                    hora=hora_vacunacion,
                    dosis=dosis_previas + 1
                )
            except Usuario.DoesNotExist:
                pass

        return vacunacion
        
    def to_representation(self, instance):
        return {
            'id_vacunacion': instance.id_vacunacion,
            'mensaje': 'Registro creado exitosamente'
        }
        
    

