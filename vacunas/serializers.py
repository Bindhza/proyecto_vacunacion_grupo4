# pyrefly: ignore [missing-import]
from django.db import transaction
# pyrefly: ignore [missing-import]
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
    rut_personal = serializers.CharField(max_length=12, required=False, allow_null=True, allow_blank=True)

    def validate_id_usuario(self, value):
        if not Usuario.objects.filter(rut=value).exists():
            raise serializers.ValidationError("El usuario con este RUT no existe.")
        return value

    def validate_campana(self, value):
        try:
            campana = Campaña.objects.get(id_campaña=value)
            if not campana.estado_campaña:
                raise serializers.ValidationError("La campaña seleccionada no está activa.")
        except Campaña.DoesNotExist:
            raise serializers.ValidationError("La campaña seleccionada no existe.")
        return value

    def validate_centro_vacunacion(self, value):
        if value is not None and not CentroVacunacion.objects.filter(id_centro=value).exists():
            raise serializers.ValidationError("El centro de vacunación seleccionado no existe.")
        return value

    def validate_rut_personal(self, value):
        if value:
            from manejo_usuarios.models import Personal
            if not Personal.objects.filter(rut=value).exists():
                raise serializers.ValidationError("El personal de la salud seleccionado no existe.")
        return value

    def validate_fecha_vacunacion(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("La fecha de vacunación no puede estar en el futuro.")
        return value

    def validate(self, data):
        campana_id = data.get('campana')
        fecha = data.get('fecha_vacunacion')
        
        if campana_id and fecha:
            try:
                campana = Campaña.objects.get(id_campaña=campana_id)
                if fecha < campana.fecha_inicio or fecha > campana.fecha_fin:
                     raise serializers.ValidationError({
                         "fecha_vacunacion": f"La fecha de vacunación debe estar dentro del rango de la campaña ({campana.fecha_inicio} a {campana.fecha_fin})."
                     })
            except Campaña.DoesNotExist:
                pass
        return data

    def create(self, validated_data):
        # pyrefly: ignore [missing-import]
        from django.db.models import Max

        id_usuario = validated_data.get('id_usuario')
        fecha_vacunacion = validated_data.get('fecha_vacunacion')
        hora_vacunacion = validated_data.get('hora_vacunacion')
        observaciones = validated_data.get('observaciones', '')
        if observaciones is None:
            observaciones = ''
        campana_id = validated_data.get('campana')
        centro_vacunacion = validated_data.get('centro_vacunacion')
        rut_personal = validated_data.get('rut_personal')

        with transaction.atomic():
            # Descontar stock de la vacuna asociada a la campaña
            campana = Campaña.objects.select_for_update().get(id_campaña=campana_id)
            vacuna = campana.vacuna
            if vacuna:
                if vacuna.stock_disponible <= 0:
                    raise serializers.ValidationError({"error": f"No hay stock disponible para la vacuna '{vacuna.nombre_vacuna}'."})
                vacuna.stock_disponible -= 1
                vacuna.save()

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
                historial_kwargs = {
                    'usuario': usuario,
                    'campana_id': campana_id,
                    'centro_vacunacion_id': centro_vacunacion,
                    'fecha': fecha_vacunacion,
                    'hora': hora_vacunacion,
                    'dosis': dosis_previas + 1
                }
                
                if rut_personal:
                    from manejo_usuarios.models import Personal
                    try:
                        personal = Personal.objects.get(rut=rut_personal)
                        historial_kwargs['personal_a_cargo'] = personal
                    except Personal.DoesNotExist:
                        pass
                        
                Historial.objects.create(**historial_kwargs)
            except Usuario.DoesNotExist:
                pass

        return vacunacion

    def to_representation(self, instance):
        return {
            'id_vacunacion': instance.id_vacunacion,
            'mensaje': 'Registro creado exitosamente'
        }
        
    

