# Cómo se despliega este TP en Netlify

## Qué significa cada paso

1. **GitHub guarda el código fuente.** El repositorio es `nicoetchegoyen/TP6-Aerolab-React`; la rama de producción es `main`.
2. **Netlify descarga esa rama.** La conexión ya existente con GitHub permite seleccionar el repositorio sin subir `node_modules` ni `.env`.
3. **Instala las dependencias y ejecuta `npm run build`.** Vite transforma JSX y módulos en archivos que el navegador puede ejecutar.
4. **Publica únicamente `dist`.** Allí están `index.html`, el JavaScript y el CSS resultantes. La URL pública sirve esos archivos; no ejecuta el servidor de desarrollo de Vite.
5. **El navegador consulta Aerolab.** `fetch` conecta directamente con la API. Netlify aloja la interfaz; los productos, el saldo y los canjes vienen de Aerolab.

## Configuración del proyecto

`netlify.toml` deja versionados el comando de build, `dist`, Node 24, `VITE_DEMO_MODE=false` y el enlace real de GitHub.

`VITE_AEROLAB_TOKEN` se carga en la sección de variables de Netlify. No se guarda su valor en Git. Las variables `VITE_` se incorporan a la build y son visibles en el navegador: aquí se usa sólo el token del challenge, que admite ese uso. No colocar contraseñas ni credenciales de otros servicios.

Después de modificar una variable hace falta una build nueva: la build publicada no cambia por editar el valor en el panel.

## Qué comprobar antes de presentar

- Abrir la URL pública y confirmar que no dice MODO PRÁCTICA.
- Ver los 32 productos reales y el saldo del servidor.
- Abrir un producto en otra ruta, recargar y volver al catálogo.
- Probar categoría, orden y paginación.
- Ver el canje real existente en Mis canjes.
- Si se realiza otro canje autorizado, comprobar su costo, descuento e historial; no repetir un POST cuando la conexión se corta sin consultar primero el estado.
- Revisar consola, imágenes y navegación móvil.
- Presentar dos enlaces: el repositorio de GitHub y la web pública. Publicar la web no entrega automáticamente la tarea en Classroom.

## Respuesta breve para el examen

“Netlify toma mi rama main de GitHub y ejecuta la build de Vite con las variables configuradas. Publica la carpeta dist. La SPA corre en el navegador y consulta Aerolab con fetch y el token del challenge. React Router cambia las vistas y la API conserva saldo e historial.”

El resultado y la URL definitivos se registrarán después de comprobar el despliegue.
