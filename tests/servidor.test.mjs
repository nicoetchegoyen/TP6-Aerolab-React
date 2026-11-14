import test from "node:test";
import assert from "node:assert/strict";
import { handler } from "../netlify/functions/aerolab.mjs";

test("Servidor: oculta credenciales y rechaza rutas, claves y datos inválidos antes de llamar a Aerolab", async () => {
  const original = globalThis.fetch;
  process.env.AEROLAB_TOKEN = "token-privado-de-prueba";
  process.env.AEROLAB_ACTION_KEY = "clave-privada-de-prueba";
  const peticion = (ruta, metodo = "GET", body, clave) => ({
    httpMethod: metodo,
    queryStringParameters: { ruta },
    headers: { "x-clave-canjes": clave },
    body: JSON.stringify(body),
  });
  let llamadas = [];
  globalThis.fetch = async (url, opciones) => {
    llamadas.push({ url, opciones });
    return Response.json({ points: 2850 });
  };
  try {
    const lectura = await handler(peticion("/user/me"));
    assert.equal(lectura.statusCode, 200);
    assert.equal(
      llamadas[0].opciones.headers.Authorization,
      "Bearer token-privado-de-prueba",
    );
    assert.ok(!JSON.stringify(lectura).includes(process.env.AEROLAB_TOKEN));
    llamadas = [];
    assert.equal(
      (await handler(peticion("https://otro-sitio.test"))).statusCode,
      405,
    );
    assert.equal(
      (await handler(peticion("/user/points", "POST", { amount: 1000 })))
        .statusCode,
      401,
    );
    assert.equal(
      (
        await handler(
          peticion("/user/points", "POST", { amount: 1000 }, "incorrecta"),
        )
      ).statusCode,
      401,
    );
    assert.equal(
      (
        await handler(
          peticion(
            "/user/points",
            "POST",
            { amount: 123 },
            "clave-privada-de-prueba",
          ),
        )
      ).statusCode,
      400,
    );
    assert.equal(
      (
        await handler(
          peticion(
            "/redeem",
            "POST",
            { productId: "invalido" },
            "clave-privada-de-prueba",
          ),
        )
      ).statusCode,
      400,
    );
    assert.equal(llamadas.length, 0);
    const carga = await handler(
      peticion(
        "/user/points",
        "POST",
        { amount: 1000, token: "dato-no-permitido" },
        "clave-privada-de-prueba",
      ),
    );
    assert.equal(carga.statusCode, 200);
    assert.equal(
      llamadas[0].url,
      "https://coding-challenge-api.aerolab.co/user/points",
    );
    assert.deepEqual(JSON.parse(llamadas[0].opciones.body), { amount: 1000 });
    assert.ok(!JSON.stringify(carga).includes("clave-privada-de-prueba"));
    globalThis.fetch = async () => {
      throw new Error("error interno con token-privado-de-prueba");
    };
    const fallo = await handler(peticion("/products"));
    assert.equal(fallo.statusCode, 502);
    assert.ok(!fallo.body.includes(process.env.AEROLAB_TOKEN));
    delete process.env.AEROLAB_TOKEN;
    assert.equal((await handler(peticion("/products"))).statusCode, 503);
  } finally {
    globalThis.fetch = original;
  }
});
