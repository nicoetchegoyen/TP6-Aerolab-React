import { consultarDemo } from "./demo.js";

export const modoDemo = import.meta.env.VITE_DEMO_MODE === "true";
let claveCanjes = "";
// La clave se escribe en la interfaz y vive sólo en memoria de esta pestaña.
export function guardarClaveCanjes(clave) {
  claveCanjes = clave;
}

// Un único lugar conoce la URL y cómo enviar el token y el cuerpo JSON.
export async function consultar(ruta, datos, signal) {
  if (modoDemo) return consultarDemo(ruta, datos);
  let respuesta;
  try {
    respuesta = await fetch(
      `/.netlify/functions/aerolab?${new URLSearchParams({ ruta })}`,
      {
        method: datos ? "POST" : "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(datos ? { "X-Clave-Canjes": claveCanjes } : {}),
        },
        body: datos ? JSON.stringify(datos) : undefined,
        signal,
      },
    );
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "No se pudo conectar con Aerolab. Revisá tu conexión y volvé a intentar.",
    );
  }
  const resultado = await respuesta.json();
  if (!respuesta.ok)
    throw new Error(resultado.message || `Error HTTP ${respuesta.status}.`);
  return resultado;
}
