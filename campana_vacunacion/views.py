from django.shortcuts import render
from rest_framework import viewsets
from .models import CentroVacunacion
from .serializers import CentroVacunacionSerializer

# Create your views here.

class CentroVacunacionViewSet(viewsets.ModelViewSet):
    queryset = CentroVacunacion.objects.all()
    serializer_class = CentroVacunacionSerializer