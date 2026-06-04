import json
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def login_view(request):
    """
    Vista (Endpoint) para procesar el inicio de sesión de un usuario.
    Recibe el RUT y la contraseña en formato JSON, consulta la base de datos SQL
    para validarlos y devuelve una respuesta de éxito o error.
    """
    # Verifica que la petición enviada por el cliente sea de tipo POST por seguridad
    if request.method == 'POST':
        try:
            # Transforma el JSON que llega desde el Frontend a un diccionario de Python
            data = json.loads(request.body)
            rut = data.get('rut')
            password = data.get('password')

            # Validación básica: revisar si ambos campos fueron enviados
            if not rut or not password:
                return JsonResponse({'error': 'Faltan credenciales (rut y password)'}, status=400)

            # authenticate hace una consulta SQL a la base de datos para verificar 
            # que existe un usuario con ese RUT y que su contraseña encriptada coincide
            user = authenticate(request, rut=rut, password=password)

            if user is not None:
                # Si las credenciales son correctas, login() registra la sesión en 
                # la base de datos (tabla django_session) y asocia la cookie
                login(request, user) 
                
                # Devuelve al Frontend los datos del usuario logueado en formato JSON
                return JsonResponse({
                    'mensaje': 'Login exitoso',
                    'usuario': {
                        'rut': user.rut,
                        'nombres': user.nombres,
                        'apellidos': user.apellidos,
                        'correo': user.correo
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
