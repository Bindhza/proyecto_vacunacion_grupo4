import json
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from .models import Paciente, Usuario
from vacunas.models import Vacuna

@csrf_exempt
# Metodo encargado de gestionar el login del usuario
def login_view(request):

    if request.method == 'POST':
        try:
            # Transforma el JSON que llega desde el Frontend a un diccionario 
            data = json.loads(request.body)
            rut = data.get('rut', '').strip()
            password = data.get('password', '').strip()

            # Revisamos que ambos campos hayan sido enviados
            if not rut or not password:
                return JsonResponse({'error': 'Faltan credenciales (rut y password)'}, status=400)


            # authenticate hace una consulta SQL a la base de datos para verificar que existe un usuario con ese RUT y que su contraseña encriptada coincide
            user = authenticate(request, username=rut, password=password)

            if user is not None:
                # Determinamos el rol del usuario
                rol = 'Usuario Base'
                if user.es_admin:
                    rol = 'Admin'
                elif user.es_personal:
                    rol = 'Personal'
                elif user.es_paciente:
                    rol = 'Paciente'

                # Si las credenciales son correctas, registramos la sesion
                login(request, user) 
                
                # Devuelve al Frontend los datos del usuario logueado en formato JSON
                return JsonResponse({
                    'mensaje': 'Login exitoso',
                    'usuario': {
                        'rut': user.rut,
                        'nombres': user.nombres,
                        'apellidos': user.apellidos,
                        'correo': user.correo,
                        'rol': rol
                    }
                })
            else:
                # Si el usuario no existe o la contraseña es incorrecta
                return JsonResponse({'error': 'Credenciales inválidas'}, status=401)
        
        except json.JSONDecodeError:
            # Si el Frontend envió un formato que no es JSON válido
            return JsonResponse({'error': 'Formato JSON inválido'}, status=400)

    # Si alguien intenta entrar a la URL escribiéndola en el navegador (método GET)
    return JsonResponse({'error': 'Método no permitido. Usa POST.'}, status=405)


#Cierra la sesion del usuario actual
@csrf_exempt
def logout_view(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'mensaje': 'Sesión cerrada exitosamente'})
    return JsonResponse({'error': 'Método no permitido. Usa POST.'}, status=405)

#Registra un nuevo paciente en el sistema
@csrf_exempt
def registro_paciente(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            campos_requeridos = ['rut', 'password', 'nombres', 'apellidos', 'correo', 'fecha_nacimiento', 'telefono']
            for campo in campos_requeridos:
                if campo not in data:
                    return JsonResponse({'error': f'Falta el campo requerido: {campo}'}, status=400)

            if Paciente.objects.filter(rut=data['rut']).exists():
                return JsonResponse({'error': 'Ya existe un usuario con este RUT'}, status=400)

            paciente = Paciente.objects.create_user(
                rut=data['rut'],
                correo=data['correo'],
                nombres=data['nombres'],
                apellidos=data['apellidos'],
                fecha_nacimiento=data['fecha_nacimiento'],
                password=data['password'],
                telefono=data['telefono']
            )
            
            return JsonResponse({'mensaje': 'Paciente registrado exitosamente'}, status=201)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Formato JSON inválido'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Método no permitido. Usa POST.'}, status=405)

#Devuelve los datos del perfil del usuario logueado
@csrf_exempt
def perfil_usuario(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'No has iniciado sesión'}, status=401)

    if request.method == 'GET':
        usuario = request.user
        
        # Transformamos las instancias de Historial en diccionarios para que JsonResponse las soporte
        historial_serializado = [
            {
                'vacuna': h.vacuna.nombre_vacuna if h.vacuna else None,
                'dosis': h.dosis,
                'fecha': h.fecha.strftime('%Y-%m-%d')
            } for h in usuario.dosis_recibidas
        ]

        datos = {
            'rut': usuario.rut,
            'nombres': usuario.nombres,
            'apellidos': usuario.apellidos,
            'correo': usuario.correo,
            'edad': usuario.obtener_edad,
            'grupo_riesgo': usuario.es_grupo_riesgo,
            'rol': 'Usuario Base',
            'historial_vacunas': historial_serializado
        }

        if usuario.es_admin:
            datos['rol'] = 'Admin'
            # Aunque sea admin, si también es paciente, le pasamos el teléfono para que su perfil no se rompa
            if usuario.es_paciente:
                datos['telefono'] = usuario.paciente.telefono
        elif usuario.es_personal:
            datos['rol'] = 'Personal'
            datos['id_personal'] = usuario.personal.id_personal
            if usuario.personal.centro_vacunacion:
                datos['centro_vacunacion_id'] = usuario.personal.centro_vacunacion.id_centro
            if usuario.es_paciente:
                datos['telefono'] = usuario.paciente.telefono
        elif usuario.es_paciente:
            datos['rol'] = 'Paciente'
            datos['telefono'] = usuario.paciente.telefono

        return JsonResponse({'usuario': datos})

    return JsonResponse({'error': 'Método no permitido. Usa GET.'}, status=405)


@csrf_exempt
def registrar_dosis_view(request):
    # Verifica que el usuario haya iniciado sesión
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'No has iniciado sesión'}, status=401)
        
    # Verifica que el usuario logueado sea del rol Personal
    if not request.user.es_personal:
        return JsonResponse({'error': 'No tienes permisos de Personal para aplicar vacunas'}, status=403)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            rut_paciente = data.get('rut_paciente')
            id_vacuna = data.get('id_vacuna')

            if not rut_paciente or not id_vacuna:
                return JsonResponse({'error': 'Faltan datos requeridos (rut_paciente, id_vacuna)'}, status=400)

            # Buscar al paciente/usuario en la base de datos
            usuario_receptor = Usuario.objects.filter(rut=rut_paciente).first()
            if not usuario_receptor:
                return JsonResponse({'error': 'El usuario receptor no existe'}, status=404)

            # Buscar la vacuna
            vacuna_aplicada = Vacuna.objects.filter(id_vacuna=id_vacuna).first()
            if not vacuna_aplicada:
                return JsonResponse({'error': 'La vacuna indicada no existe'}, status=404)

            # Se utiliza el método del Personal para registrar la dosis 
            personal = request.user.personal
            nuevo_registro = personal.registrar_vacuna(usuario_receptor, vacuna_aplicada)

            return JsonResponse({
                'mensaje': 'Vacuna registrada exitosamente',
                'registro': {
                    'paciente': nuevo_registro.usuario.rut,
                    'vacuna': nuevo_registro.vacuna.nombre_vacuna,
                    'dosis': nuevo_registro.dosis,
                    'fecha': nuevo_registro.fecha.strftime('%Y-%m-%d')
                }
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Formato JSON inválido'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Método no permitido. Usa POST.'}, status=405)