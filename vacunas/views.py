from rest_framework import viewsets
from .models import *
from .serializers import *



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