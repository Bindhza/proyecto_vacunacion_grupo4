from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

routerCentro = DefaultRouter()
routerCentro.register(r'centro', views.CentroVacunacionViewSet, basename='centro')
routerCentro.register(r'campana_crud', views.CampañaViewSet, basename='campana_crud')

urlpatterns = [
    path('', include(routerCentro.urls)),
]