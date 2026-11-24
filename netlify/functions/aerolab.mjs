import { createHash, timingSafeEqual } from "node:crypto";

const API = "https://coding-challenge-api.aerolab.co";
const lecturas = ["/products", "/user/me", "/user/history"];
const escrituras = ["/redeem", "/user/points"];

function responder(statusCode, datos) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
    body: JSON.stringify(datos),
  };
}

function claveValida(recibida, esperada) {
  if (!recibida || !esperada) return false;
  const hash = (texto) => createHash("sha256").update(texto).digest();
  return timingSafeEqual(hash(recibida), hash(esperada));
}

export async function handler(event) {
  const ruta = event.queryStringParameters?.ruta;
  const metodo = event.httpMethod;
  const esLectura = metodo === "GET" && lecturas.includes(ruta);
  const esEscritura = metodo === "POST" && escrituras.includes(ruta);
  // Lista cerrada: el visitante no puede usar la función para consultar otra URL.
  if (!esLectura && !esEscritura)
    return responder(405, { message: "Ruta o método no permitido." });
  if (!process.env.AEROLAB_TOKEN)
    return responder(503, {
      message: "Falta configurar AEROLAB_TOKEN en el servidor.",
    });
  let datos;
  if (esEscritura) {
    if (
      !claveValida(
        event.headers?.["x-clave-canjes"],
        process.env.AEROLAB_ACTION_KEY,
      )
    )
      return responder(401, {
        message:
          "Ingresá la clave de canjes correcta para realizar esta operación.",
      });
    if ((event.body || "").length > 2048)
      return responder(413, { message: "Solicitud demasiado grande." });
    try {
      datos = JSON.parse(event.body || "");
    } catch {
      return responder(400, { message: "El cuerpo debe ser JSON válido." });
    }
    if (!datos || typeof datos !== "object" || Array.isArray(datos))
      return responder(400, { message: "Datos inválidos." });
    if (ruta === "/user/points") {
      if (![1000, 5000, 7500].includes(datos.amount))
        return responder(400, {
          message: "La cantidad debe ser 1000, 5000 o 7500.",
        });
      datos = { amount: datos.amount };
    } else {
      if (
        typeof datos.productId !== "string" ||
        !/^[a-f0-9]{24}$/i.test(datos.productId)
      )
        return responder(400, { message: "ID de producto inválido." });
      datos = { productId: datos.productId };
    }
  }
  try {
    const respuesta = await fetch(`${API}${ruta}`, {
      method: metodo,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AEROLAB_TOKEN.trim()}`,
      },
      body: esEscritura ? JSON.stringify(datos) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    if (respuesta.status >= 500)
      return responder(503, {
        message: "El servicio de Aerolab no está disponible temporalmente. Volvé a intentar más tarde.",
      });
    if (!respuesta.ok)
      return responder(respuesta.status, {
        message: `Aerolab rechazó la operación (HTTP ${respuesta.status}).`,
      });
    const resultado = await respuesta.json();
    // Aerolab puede devolver HTTP 200 con {} durante una falla interna.
    // Detectarlo antes de que React intente usar productos o un saldo inexistente.
    if (esLectura) {
      const valido = ruta === "/products"
        ? Array.isArray(resultado) && resultado.length > 0 && resultado.every(p =>
          p && typeof p._id === "string" && typeof p.name === "string" && Number.isFinite(p.cost))
        : ruta === "/user/history"
          ? Array.isArray(resultado)
          : resultado && typeof resultado.name === "string" && Number.isFinite(resultado.points);
      if (!valido) return responder(503, {
        message: "Aerolab respondió sin los datos necesarios. Su servicio puede estar temporalmente fuera de servicio.",
      });
    }
    return responder(200, resultado);
  } catch {
    // No devolver excepciones ni cabeceras con datos internos.
    return responder(502, {
      message:
        "No se pudo comunicar con Aerolab. Verificá saldo e historial antes de repetir una operación.",
    });
  }
}
