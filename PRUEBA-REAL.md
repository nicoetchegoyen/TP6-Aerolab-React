# Prueba de integración real · 14 de noviembre de 2026

Se obtuvo un token propio usando `join` en el generador oficial de Aerolab y se recuperó del correo de bienvenida enviado por `hey@aerolab.co`. La credencial está sólo en `.env`, excluido de Git. El usuario de prueba que devuelve esta API se llama John Kite.

## Consultas verificadas

`npm run probar:api` ejecuta consultas reales de sólo lectura:

| Solicitud | Respuesta | Resultado |
| --- | --- | --- |
| GET `/user/me` | HTTP 200 | Saldo inicial: 2000 puntos |
| GET `/products` | HTTP 200 | Catálogo de 32 productos |
| GET `/user/history` | HTTP 200 | Historial inicialmente vacío |

También se abrió la aplicación con `npm run dev`, sin modo demo. Se mostraron los nombres, categorías e imágenes reales de los productos.

## Canje real verificado en el navegador

1. Se abrió la ruta de detalle de Kobo Aura.
2. Se pulsó **Canjear ahora**. La app envió POST `/redeem` con su `productId`.
3. Se volvió a consultar GET `/user/me`: el saldo pasó de **2000 a 1850**.
4. GET `/user/history` devolvió el canje y la interfaz mostró **Kobo Aura · 150 puntos**.

Con autorización específica del titular se pulsó **+1.000 puntos**: POST `/user/points` funcionó y el saldo consultado al servidor pasó de **1850 a 2850 puntos**. El canje continuó registrado en el historial.

Repositorio del proyecto: https://github.com/nicoetchegoyen/TP6-Aerolab-React. Web pública: https://tp6-aerolab-nicoetchegoyen.netlify.app/

## Cómo explicarlo en el examen

- El token viaja en el encabezado `Authorization: Bearer ...`; no es una contraseña de GitHub.
- GET consulta información; POST envía una operación que modifica datos.
- El frontend no descuenta un saldo inventado: después del POST vuelve a consultar al servidor.
- `useState` conserva los datos que ve la pantalla. Al actualizar el estado, React vuelve a renderizar.
- Las rutas cambian la vista sin recargar todo el documento. El detalle usa el ID de la URL para buscar en el catálogo.
- `.gitignore` evita versionar `.env`, pero las variables VITE_ se incorporan al cliente: no son secretos ocultos en el navegador.

## Versión con token oculto y despliegue público

El navegador ahora consulta una función de Netlify. La función lee AEROLAB_TOKEN en el servidor y exige AEROLAB_ACTION_KEY para POST. Se comprobaron tres pruebas automáticas, build sin credenciales y consultas reales a través de la función. En producción se obtuvieron los mismos 32 productos, 2850 puntos y un canje. Se verificó bloqueo 401 sin clave y validación 400 con clave correcta y cantidad inválida, sin nuevas operaciones que modifiquen el saldo.
