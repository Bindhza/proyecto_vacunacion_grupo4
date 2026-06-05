from rest_framework.generics import CreateAPIView
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from manejo_usuarios.models import Personal



class VacunaViewSet(viewsets.ModelViewSet):
    queryset = Vacuna.objects.all()
    serializer_class = VacunaSerializer

class VacunacionViewSet(viewsets.ModelViewSet):
    queryset = Vacunacion.objects.all()
    serializer_class = VacunacionSerializer

class UsuarioRecibioVacunaViewSet(viewsets.ModelViewSet):
    queryset = UsuarioRecibioVacuna.objects.all()
    serializer_class = UsuarioRecibioVacunaSerializer

class VacunacionPorCampañaViewSet(viewsets.ModelViewSet):
    queryset = VacunacionPorCampaña.objects.all()
    serializer_class = VacunacionPorCampañaSerializer

class CrearVacunacionRegistroAPIView(CreateAPIView):
    serializer_class = FormularioVacunacionSerializer


#funcion para pedir rut del personal del frontend y validar si es personal de la salud
#si lo es retorna su centro de vacunacion
#si no lo es retorna un error
class ValidarPersonalAPIView(APIView):
    def post(self, request):
        rut = request.data.get('rut')

        #se valida que el rut no sea nulo
        if not rut:
            return Response({'error': 'El RUT es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            personal = Personal.objects.get(rut=rut)
            centro_id = personal.centro_vacunacion.id_centro if personal.centro_vacunacion else None
            return Response({
                'existe': True,
                'centro_vacunacion': centro_id
            }, status=status.HTTP_200_OK)
        except Personal.DoesNotExist:
            return Response({
                'existe': False,
                'error': 'El RUT ingresado no corresponde a personal de la salud.'
            }, status=status.HTTP_200_OK)
    
    