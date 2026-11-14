# Cómo se despliega este TP en Netlify

## Qué significa cada paso

1. **GitHub guarda el código fuente.** El repositorio es `nicoetchegoyen/TP6-Aerolab-React`; la rama de producción es `main`.
2. **Netlify descarga esa rama.** La conexión ya existente con GitHub permite seleccionar el repositorio sin subir `node_modules` ni `.env`.
3. **Instala las dependencias y ejecuta `npm run build`.** Vite transforma JSX y módulos en archivos que el navegador puede ejecutar.
4. **Publica únicamente `dist`.** Allí están `index.html`, el JavaScript y el CSS resultantes. La URL pública sirve esos archivos; no ejecuta el servidor de desarrollo de Vite.
5. **El navegador consulta la función de Netlify.** La función añade el token privado y consulta Aerolab. Los POST requieren además la clave de canjes.

## Configuración del proyecto

`netlify.toml` deja versionados el comando de build, `dist`, Node 24, `VITE_DEMO_MODE=false` y el enlace real de GitHub.

`AEROLAB_TOKEN` y `AEROLAB_ACTION_KEY` se cargan como variables secretas de Netlify, disponibles para Functions. No tienen prefijo VITE_ y sus valores no se guardan en Git ni se incorporan al JavaScript público. Para hacer canjes se ingresa la clave adicional en la interfaz.

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

“Netlify toma mi rama main de GitHub y ejecuta la build de Vite con las variables configuradas. Publica la carpeta dist. La SPA corre en el navegador y consulta una función de Netlify, que usa el token privado para llamar a Aerolab. Los canjes requieren una clave adicional. React Router cambia las vistas y la API conserva saldo e historial.”

Publicado y comprobado el 14/11/2026: https://tp6-aerolab-nicoetchegoyen.netlify.app/

Desde producción: GET de productos/perfil/historial HTTP 200; 32 productos, 2850 puntos y un canje. POST sin clave devuelve 401. POST con clave correcta y cantidad inválida devuelve 400, sin alterar el saldo. Los archivos públicos fueron revisados y no contienen ninguna de las dos credenciales. No se realizó otro canje ni otra carga de puntos en esta verificación.
