// Prueba real de sólo lectura. El token se carga desde .env y nunca se imprime.
import assert from "node:assert/strict";

const token = process.env.VITE_AEROLAB_TOKEN?.trim();
if (!token) {
  console.error("Falta VITE_AEROLAB_TOKEN en .env. Copiá primero .env.example.");
  process.exit(1);
}

async function consultar(ruta) {
  const respuesta = await fetch(`https://coding-challenge-api.aerolab.co${ruta}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15000),
  });
  console.log(`GET ${ruta}: HTTP ${respuesta.status}`);
  if (!respuesta.ok) throw new Error(`La API rechazó ${ruta} (HTTP ${respuesta.status}).`);
  return respuesta.json();
}

try {
  const [usuario, productos, historial] = await Promise.all([
    consultar("/user/me"),
    consultar("/products"),
    consultar("/user/history"),
  ]);
  assert.equal(typeof usuario.name, "string", "El perfil debe tener un nombre.");
  assert.equal(typeof usuario.points, "number", "El saldo debe ser numérico.");
  assert.ok(Array.isArray(productos), "El catálogo debe ser un array.");
  assert.ok(productos.length > 0, "El catálogo no debe estar vacío.");
  assert.ok(productos.every(producto => producto._id && producto.name && typeof producto.cost === "number"), "Los productos deben tener ID, nombre y costo.");
  assert.ok(Array.isArray(historial), "El historial debe ser un array.");
  console.log(`Verificado: ${productos.length} productos, saldo de ${usuario.points} puntos y ${historial.length} canjes en el historial.`);
  console.log("La prueba no agrega puntos ni canjea productos. El token no se mostró.");
} catch (error) {
  console.error(`No se completó la prueba: ${error.message}`);
  process.exitCode = 1;
}
