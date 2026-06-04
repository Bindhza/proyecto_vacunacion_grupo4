from django.urls.conf import include
from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

routerVacuna = DefaultRouter()
routerVacuna.register(r'vacunas', views.VacunaViewSet, basename='vacuna')

routerVacunacion = DefaultRouter()
routerVacunacion.register(r'vacunacion', views.VacunacionViewSet, basename='vacunacion')

routerUsuarioRecibioVacuna = DefaultRouter()
routerUsuarioRecibioVacuna.register(r'usuario_recibio_vacuna', views.UsuarioRecibioVacunaViewSet, basename='usuario_recibio_vacuna')

routerVacunacionPorCampaña = DefaultRouter()
routerVacunacionPorCampaña.register(r'vacunacion_por_campaña', views.VacunacionPorCampañaViewSet, basename='vacunacion_por_campaña')

urlpatterns = [
    path('', include(routerVacuna.urls)),
    path('', include(routerVacunacion.urls)),
    path('', include(routerUsuarioRecibioVacuna.urls)),
    path('', include(routerVacunacionPorCampaña.urls)),
]
