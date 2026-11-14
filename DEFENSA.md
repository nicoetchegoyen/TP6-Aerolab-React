# Actualización: token oculto en servidor

El navegador llama a la función `netlify/functions/aerolab.mjs` mediante `src/api.js`. Sólo la función conoce `AEROLAB_TOKEN` y añade el encabezado Bearer al consultar Aerolab. La función permite sólo tres GET y dos POST; valida los datos y exige una clave adicional para POST. Un visitante puede explorar, pero no modificar el saldo sin esa clave. La clave de canjes se ingresa en la interfaz y se compara en el servidor; no es el token de Aerolab.

Para practicar con la API real: iniciar `npm run dev`, abrir Acceso a canjes e ingresar el valor privado `AEROLAB_ACTION_KEY` del `.env`. Para presentar remotamente, compartir esa clave con el profesor por un canal privado. No mostrar `.env` en una captura pública.

Los recorridos de React explicados abajo siguen siendo los mismos; donde se habla de la API, el navegador ahora pasa por la función de servidor. Las credenciales ya no usan variables VITE_.

# Cómo defender Aerolab

## Explicación de un minuto

“Hice una SPA de recompensas en React. Al iniciar, pido el catálogo y el usuario a Aerolab. Guardo ambos en el estado. El catálogo permite ordenar, filtrar y paginar. Al entrar a un producto, React Router lee el ID de la URL y busco ese producto en el listado. Para canjear, envío su ID con POST y vuelvo a consultar el saldo al servidor. El historial muestra lo que devuelve la API. Sin token puedo practicar con una simulación marcada en pantalla.”

## Recorrido del código

1. `index.html` contiene `root` y carga `main.jsx`.
2. `main.jsx` usa `createRoot` para montar `App` y `HashRouter` para interpretar la URL.
3. El `useEffect` inicial de `App.jsx` llama a `consultar` para `/products` y `/user/me`. `Promise.all` espera las dos respuestas.
4. `setProductos` y `setUsuario` actualizan el estado. React vuelve a dibujar los componentes con esos datos.
5. `Catalogo` recibe datos y funciones por props. Usa `filter`, una copia con `sort` y después `slice` para mostrar una página.
6. `Producto` muestra una tarjeta. Su botón llama a `canjear` en el componente padre.
7. `ejecutarAccion` bloquea otros envíos, hace el POST, vuelve a pedir el usuario y muestra un mensaje.
8. La ruta del historial consulta `/user/history` cuando se abre.

## Preguntas esperables

**¿Qué es una SPA?** Un documento HTML cuyas vistas cambian con JavaScript. No se descarga otro documento completo en cada navegación interna.

**¿Estado y props?** El estado es información que un componente conserva y puede actualizar. Las props son datos y funciones que recibe del padre. El saldo vive en `App` para que cabecera y tarjetas compartan el mismo valor.

**¿Para qué useEffect?** Para sincronizar con algo externo, en este caso la API. Sus dependencias indican cuándo volver a ejecutar el efecto. El retorno cancela solicitudes de la vista que se abandona.

**¿Qué hacen async y await?** Permiten esperar una promesa sin bloquear toda la aplicación. `try/catch` maneja errores.

**¿Por qué fetch y después json?** `fetch` entrega la respuesta HTTP; `json()` lee su cuerpo y lo convierte a objetos/arrays. `fetch` no rechaza automáticamente un HTTP 401 o 500: por eso se revisa `respuesta.ok`.

**¿GET y POST?** GET consulta datos. POST envía una operación: agregar puntos o canjear. `JSON.stringify` convierte el objeto al texto JSON del cuerpo.

**¿Quién comprueba el saldo?** El frontend deshabilita acciones inválidas para orientar al usuario. La API debe volver a validar y descontar; el navegador no es la autoridad. Después del canje se consulta el saldo real.

**¿Por qué copiar antes de sort?** `sort` modifica el array original. `[...filtrados]` permite ordenar sin modificar las props ni los datos compartidos.

**¿Por qué useRef y un estado ocupado?** El estado controla qué se ve. El ref bloquea inmediatamente otro envío, incluso antes del siguiente render. Evita dobles clics locales; no garantiza deduplicación del servidor ante una conexión cortada. Por eso no se repite automáticamente un POST.

**¿Cómo funciona el detalle si no hay endpoint individual?** Se carga el catálogo completo y `find` obtiene el producto cuyo ID coincide con `useParams`. También funciona al recargar esa ruta.

**¿Qué hace la key?** Identifica de forma estable cada tarjeta para que React relacione los elementos entre renders.

**¿Cómo ocultaste el token?** No basta con `.env`: las variables VITE_ son públicas. Por eso el token se llama AEROLAB_TOKEN, se lee sólo en la función de Netlify y nunca se importa desde React. La build fue revisada para verificar que no contiene ninguna de las dos credenciales.

**¿Por qué CSS propio y HashRouter?** CSS evita otra biblioteca de estilos. HashRouter permite rutas en un hosting estático sin configurar reescrituras.

## Demostración para practicar

1. Iniciar con `npm run dev:demo` y explicar el cartel.
2. Mostrar saldo de 3000. Ver que un producto de 4500 indica que faltan 1500 y tiene el botón deshabilitado.
3. Abrir Auriculares, que cuestan 1200; canjear y mostrar saldo de 1800.
4. Abrir Mis canjes y mostrar el registro.
5. Agregar 1000 puntos y mostrar saldo de 2800.
6. Volver al catálogo, cambiar categoría, ordenar y recorrer páginas.
7. Explicar que para la entrega esos mismos flujos deben verificarse con el token real y con el sitio publicado.

Estudiá primero el recorrido de los datos. Después explicá cada línea con tus palabras: no hace falta memorizar el CSS.
