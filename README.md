# TP6 · Aerolab · Programación Avanzada 2024


## Empezar a practicar

Requisito: Node.js 22.12 o posterior. Desde esta carpeta:

```powershell
npm install
npm run dev:demo
```

Abrir la dirección que muestra la terminal: normalmente `http://127.0.0.1:5173/`.

El modo práctica usa productos ficticios, sin llamadas a Aerolab. El cartel lo identifica siempre. Saldo e historial viven en memoria y se reinician al recargar. No acredita integración con la API real.

## Conectar la API real

Actualización del 14/11/2026: el generador funcionó, se recibió el token y la integración real devolvió HTTP 200 en perfil, catálogo e historial. Se verificaron un canje de 150 puntos y una carga de 1000 puntos. Ver `PRUEBA-REAL.md` para la evidencia y el recorrido de defensa. Repositorio: [TP6-Aerolab-React](https://github.com/nicoetchegoyen/TP6-Aerolab-React). El despliegue público del sitio sigue pendiente.

1. Obtener un token propio siguiendo las instrucciones del challenge. La [documentación oficial](https://aerolabchallenge.docs.apiary.io/) indica entrar en [Aerolab](https://aerolab.co/coding-challenge), escribir `join` y completar el correo. El correo de bienvenida contiene el token; revisar también spam. La consigna de 2024 usa el dominio anterior `aerolab.us`.
2. Copiar `.env.example` como `.env` y completar `VITE_AEROLAB_TOKEN` sin la palabra `Bearer`.
3. Mantener `VITE_DEMO_MODE=false` y ejecutar `npm run dev`.
4. Si se cambia `.env`, reiniciar el servidor. No subir el archivo con el token a GitHub.

Para comprobar el acceso sin cambiar saldo ni hacer canjes, ejecutar `npm run probar:api`. El comando carga `.env`, consulta perfil, catálogo e historial, y muestra estados HTTP y cantidades sin imprimir el token.

Las variables `VITE_` se incluyen en el JavaScript del navegador: **no son secretos ocultos**. Se usa el token del ejercicio, cuyo uso en frontend está expresamente permitido por la documentación de Aerolab. No colocar contraseñas ni credenciales de otros servicios. Para un producto con secretos reales correspondería un servidor intermediario; no se agregó esa complejidad a este TP.

## Cobertura de la consigna

Fuente: `SPA - Aerolab.pdf`, tres páginas. Se distingue su pedido del material externo. El challenge actual de Aerolab trata sobre videojuegos: aquí se sigue el catálogo de recompensas de la consigna y la [rama histórica 2022](https://github.com/Aerolab/frontend-developer-coding-challenge/tree/2022), no el challenge nuevo.

| Requisito | Código / comportamiento | Validación o pendiente |
| --- | --- | --- |
| SPA ReactJS | `main.jsx`, `App.jsx`, React Router | Compila |
| Listado de todos los productos desde Aerolab | `GET /products`; filtros y páginas recorren el conjunto completo | Verificados 32 productos con la API real |
| Detalle en otra ruta | `#/productos/:id`, `Detalle` en `App.jsx` | Probado en navegador. La API no documenta detalle individual: se usa `find` sobre el catálogo |
| Token de validación | `Authorization: Bearer ...` en `api.js` | Token propio recibido y verificado con HTTP 200 |
| Diseño libre y recursos | CSS propio responsive; usa las imágenes que entregue la API | La consigna permite diseño propio. No se recibió la carpeta original |
| App accesible en producción | `npm run build`, rutas con hash y base relativa | Build aprobado; falta publicar y comprobar la URL real |
| Mínimos del challenge: precio, saldo, orden de precios | Tarjetas, cabecera, select de orden | Implementados; interfaz comprobada en práctica |
| Distinguir canjeables y faltantes | Mensaje de disponibilidad, diferencia de puntos y botón deshabilitado | Comprobado en práctica |
| Canjear y descontar puntos | POST `/redeem`, después GET `/user/me`; bloqueo durante la solicitud | Canje real Kobo Aura: 2000 - 150 = 1850 puntos; historial confirmado |
| Agregar puntos | POST `/user/points`, sólo 1000, 5000 o 7500 | Carga real autorizada: 1850 + 1000 = 2850 puntos |
| Enlace al repositorio en el pie | `VITE_REPO_URL` | URL real incluida en `.env.example` |
| Mejoras: categorías, páginas, historial, móvil | `Catalogo.jsx`, `Historial`, CSS | Implementadas y revisadas según `VERIFICACION.md` del directorio superior |

No se inventan descripciones: el detalle muestra nombre, imagen, categoría, costo y disponibilidad que provee el catálogo.

## Publicación y entrega

Cada carpeta es un proyecto independiente: se puede subir sólo ésta a un repositorio nuevo. Si se sube toda la carpeta de la materia a un único repo, seleccionar `tp6-aerolab` como directorio base en el hosting.

1. Crear el repositorio en GitHub y subir el código, incluidos `package.json` y `package-lock.json`, sin `node_modules`, `dist` ni `.env`.
2. Completar `VITE_REPO_URL` con el enlace real del repositorio.
3. En Netlify seleccionar el repo, comando `npm run build`, directorio publicado `dist` y Node 24 (o compatible).
4. Configurar allí `VITE_AEROLAB_TOKEN`, `VITE_DEMO_MODE=false` y `VITE_REPO_URL`. Ejecutar un nuevo despliegue después de cambiar variables.
5. Abrir la URL pública y comprobar catálogo, ruta directa/recarga del detalle, saldo, canje e historial. Usar el token del ejercicio.
6. Registrar el enlace del despliegue. El código está en [GitHub](https://github.com/nicoetchegoyen/TP6-Aerolab-React); todavía falta publicar el sitio.

Para revisar producción en tu computadora: `npm run build` y después `npm run preview`. Para repetir las pruebas del servicio: `npm test`. El Classroom está archivado: confirmar con el profesor dónde presentar hoy.

## Estructura para estudiar

- `main.jsx`: punto de entrada y router.
- `App.jsx`: carga inicial, saldo, acciones, rutas, detalle e historial.
- `Catalogo.jsx`: categoría, orden y paginación local.
- `Producto.jsx`: tarjeta e imagen reutilizable.
- `api.js`: solicitudes HTTP y mensajes de error.
- `demo.js`: simulación explícita para practicar.
- `styles.css`: presentación y adaptación a pantallas.
- `tests/api.test.mjs`: contrato de red y reglas del simulador, sin credenciales reales.
