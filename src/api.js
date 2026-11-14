import { consultarDemo } from "./demo.js";

export const modoDemo = import.meta.env.VITE_DEMO_MODE === "true";
export const tieneToken = Boolean(import.meta.env.VITE_AEROLAB_TOKEN?.trim());
const API = "https://coding-challenge-api.aerolab.co";

// Un único lugar conoce la URL y cómo enviar el token y el cuerpo JSON.
export async function consultar(ruta, datos, signal) {
  if (modoDemo) return consultarDemo(ruta, datos);
  if (!tieneToken)
    throw new Error("Falta configurar VITE_AEROLAB_TOKEN en el archivo .env.");
  let respuesta;
  try {
    respuesta = await fetch(`${API}${ruta}`, {
      method: datos ? "POST" : "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_AEROLAB_TOKEN.trim()}`,
      },
      body: datos ? JSON.stringify(datos) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "No se pudo conectar con Aerolab. Revisá tu conexión y volvé a intentar.",
    );
  }
  if (!respuesta.ok) {
    if ([401, 403].includes(respuesta.status))
      throw new Error("Aerolab rechazó el token. Revisá tu credencial.");
    throw new Error(
      `Aerolab no pudo completar la solicitud (HTTP ${respuesta.status}).`,
    );
  }
  return respuesta.json();
}
