// Prueba real de sólo lectura. El token se carga desde .env y nunca se imprime.
import assert from "node:assert/strict";
import { handler } from "../netlify/functions/aerolab.mjs";

const token = process.env.AEROLAB_TOKEN?.trim();
if (!token) {
  console.error("Falta AEROLAB_TOKEN en .env. Copiá primero .env.example.");
  process.exit(1);
}

async function consultar(ruta) {
  const respuesta = await handler({
    httpMethod: "GET",
    queryStringParameters: { ruta },
  });
  console.log(
    `GET ${ruta} a través de la función: HTTP ${respuesta.statusCode}`,
  );
  if (respuesta.statusCode !== 200)
    throw new Error(
      `La función rechazó ${ruta} (HTTP ${respuesta.statusCode}).`,
    );
  return JSON.parse(respuesta.body);
}

try {
  const [usuario, productos, historial] = await Promise.all([
    consultar("/user/me"),
    consultar("/products"),
    consultar("/user/history"),
  ]);
  assert.equal(
    typeof usuario.name,
    "string",
    "El perfil debe tener un nombre.",
  );
  assert.equal(typeof usuario.points, "number", "El saldo debe ser numérico.");
  assert.ok(Array.isArray(productos), "El catálogo debe ser un array.");
  assert.ok(productos.length > 0, "El catálogo no debe estar vacío.");
  assert.ok(
    productos.every(
      (producto) =>
        producto._id && producto.name && typeof producto.cost === "number",
    ),
    "Los productos deben tener ID, nombre y costo.",
  );
  assert.ok(Array.isArray(historial), "El historial debe ser un array.");
  console.log(
    `Verificado: ${productos.length} productos, saldo de ${usuario.points} puntos y ${historial.length} canjes en el historial.`,
  );
  console.log(
    "La prueba no agrega puntos ni canjea productos. El token no se mostró.",
  );
} catch (error) {
  console.error(`No se completó la prueba: ${error.message}`);
  process.exitCode = 1;
}
