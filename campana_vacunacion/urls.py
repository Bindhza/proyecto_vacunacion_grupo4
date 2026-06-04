from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

routerCentro = DefaultRouter()
routerCentro.register(r'centro', views.CentroVacunacionViewSet, basename='centro')

urlpatterns = [
    path('', include(routerCentro.urls)),
]