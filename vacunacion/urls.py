"""
URL configuration for vacunacion project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from manejo_usuarios.views import login_view, actualizar_correo_view, actualizar_telefono_view
from campana_vacunacion.views import get_campanas, get_centros, get_citas, agendar_cita, get_citas_paciente, cancelar_cita

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('vacunas.urls')),
    path('api/', include('campana_vacunacion.urls')),
    path('api/login/', login_view, name='login'),
    path('api/campanas/', get_campanas, name='campanas'),
    path('api/campanas/<int:campana_id>/centros/', get_centros, name='centros'),
    path('api/campanas/<int:campana_id>/centros/<int:centro_id>/citas/', get_citas, name='citas'),
    path('api/agendar/', agendar_cita, name='agendar'),
    path('api/cancelar/', cancelar_cita, name='cancelar'),
    path('api/actualizar_correo/', actualizar_correo_view, name='actualizar_correo'),
    path('api/actualizar_telefono/', actualizar_telefono_view, name='actualizar_telefono'),
    path('api/paciente/<str:rut>/citas/', get_citas_paciente, name='citas_paciente'),
]
