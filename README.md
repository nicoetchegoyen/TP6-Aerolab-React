# TP6 · Aerolab · Programación Avanzada 2024

SPA React con JavaScript, React Router y CSS. El token de Aerolab se conserva en una función de servidor de Netlify y no se incorpora al JavaScript público.

## Cómo funciona

1. React pide productos, usuario e historial a `/.netlify/functions/aerolab`.
2. La función consulta Aerolab con `AEROLAB_TOKEN`, una variable privada del servidor.
3. El catálogo y los detalles pueden consultarse públicamente.
4. Para canjear o cargar puntos, el visitante debe ingresar una clave en **Acceso a canjes**. El servidor la compara con `AEROLAB_ACTION_KEY`. La clave no está en Git ni en la build.
5. Después de cada operación, React vuelve a consultar el saldo real.

Ocultar el token no bastaría si cualquiera pudiera modificar el saldo usando la función. Por eso los POST requieren la clave adicional. No es un sistema de usuarios completo: es un acceso compartido sencillo para la defensa del TP. Compartir la clave permite operar la cuenta del ejercicio; no publicarla en el repositorio.

## Ejecutar localmente

Requiere Node 22.12 o posterior. Ejecutar `npm install`. Copiar `.env.example` como `.env`, completar `AEROLAB_TOKEN` y `AEROLAB_ACTION_KEY`, y ejecutar `npm run dev`.

La configuración de Vite incluye un adaptador local que ejecuta la misma función de Netlify. Los secretos se leen en Node y no se entregan a React. Para practicar sin API, `npm run dev:demo` usa datos ficticios claramente identificados.

- `npm test`: contrato del cliente, validaciones del servidor y simulador.
- `npm run probar:api`: consultas reales de sólo lectura a través de la función.
- `npm run build`: genera los archivos públicos en `dist`.
- `npm run preview`: sirve sólo los archivos estáticos; no emula las funciones. Para probar la API local usar `npm run dev`.

## Configuración en Netlify

Importar [el repositorio](https://github.com/nicoetchegoyen/TP6-Aerolab-React), rama `main`. `netlify.toml` configura:

- Build: `npm run build`.
- Directorio publicado: `dist`.
- Funciones: `netlify/functions`.
- Node: 24; modo demo desactivado.

Agregar `AEROLAB_TOKEN` y `AEROLAB_ACTION_KEY` en las variables de Netlify, disponibles para Functions. Marcarlas como secretas. No usar el prefijo `VITE_` para estas credenciales y no colocarlas en `netlify.toml`. Las variables declaradas sólo en ese archivo no llegan al entorno de ejecución de las funciones. Volver a desplegar después de cambiar variables.

## Cobertura de la consigna

| Requisito | Implementación |
| --- | --- |
| SPA React | `main.jsx`, `App.jsx`, HashRouter |
| Catálogo real completo | GET `/products` a través de la función; 32 productos verificados |
| Otra ruta para el detalle | `#/productos/:id`; búsqueda por ID sobre el catálogo |
| Token de validación | Sólo la función envía `Authorization: Bearer ...` a Aerolab |
| Precio, saldo, faltante y canje | Tarjetas y detalle; POST `/redeem`, saldo e historial del servidor |
| Carga de puntos | POST `/user/points`; sólo 1000, 5000 o 7500 |
| Orden de precios | Ascendente y descendente, sin modificar los datos originales |
| Diseño libre y responsive | CSS propio; imágenes provistas por Aerolab |
| Historial, categorías y páginas | Implementados como mejoras de uso |
| Enlace al código | Pie de página con el repositorio real |
| Despliegue público | Registrar la URL y verificarla después de publicar |

La fuente es `SPA - Aerolab.pdf` (2024), más los mínimos del [challenge histórico de recompensas](https://github.com/Aerolab/frontend-developer-coding-challenge/tree/2022). No se sigue el nuevo challenge de videojuegos. El PDF permite diseño propio.

## Archivos para estudiar

- `src/App.jsx`: estado, rutas, operaciones, detalle e historial.
- `src/Catalogo.jsx`: filtros, orden y páginas.
- `src/Producto.jsx`: tarjeta e imagen.
- `src/api.js`: solicitudes a la función; no contiene el token.
- `netlify/functions/aerolab.mjs`: lista de rutas permitidas, clave de canjes, validación y solicitudes a Aerolab.
- `vite.config.js`: entorno local y adaptador de la función.
- `DEFENSA.md`: preguntas para el examen.
- `PRUEBA-REAL.md`: resultados de integración.
- `DESPLIEGUE.md`: explicación de publicación.

El archivo `.env`, `node_modules` y `dist` están excluidos de Git. La clave de canjes se mantiene sólo en memoria de la pestaña que la ingresa: hay que volver a escribirla al recargar.
