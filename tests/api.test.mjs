import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { consultarDemo } from "../src/demo.js";

test("Contrato HTTP de Aerolab: métodos, autenticación y errores", async () => {
  // Se prueba el servicio real, sustituyendo sólo la red; no se gastan puntos.
  process.env.VITE_DEMO_MODE = "false";
  process.env.VITE_AEROLAB_TOKEN = "token-ficticio-para-pruebas";
  const servidor = await createServer({
    configFile: false,
    server: { middlewareMode: true },
    logLevel: "silent",
  });
  const fetchOriginal = globalThis.fetch;
  try {
    const { consultar } = await servidor.ssrLoadModule("/src/api.js");
    const solicitudes = [];
    globalThis.fetch = async (url, opciones) => {
      solicitudes.push({ url, opciones });
      return Response.json({ ok: true });
    };
    await consultar("/products");
    await consultar("/redeem", { productId: "producto-1" });
    await consultar("/user/points", { amount: 1000 });
    assert.equal(
      solicitudes[0].url,
      "https://coding-challenge-api.aerolab.co/products",
    );
    assert.equal(solicitudes[0].opciones.method, "GET");
    assert.equal(solicitudes[1].opciones.method, "POST");
    assert.deepEqual(JSON.parse(solicitudes[1].opciones.body), {
      productId: "producto-1",
    });
    assert.equal(
      solicitudes[1].opciones.headers.Authorization,
      "Bearer token-ficticio-para-pruebas",
    );
    assert.deepEqual(JSON.parse(solicitudes[2].opciones.body), {
      amount: 1000,
    });
    globalThis.fetch = async () => new Response("", { status: 401 });
    await assert.rejects(consultar("/user/me"), /rechazó el token/);
    globalThis.fetch = async () => new Response("", { status: 500 });
    await assert.rejects(consultar("/products"), /HTTP 500/);
    globalThis.fetch = async () => {
      throw new TypeError("sin red");
    };
    await assert.rejects(consultar("/products"), /No se pudo conectar/);
    globalThis.fetch = async () => {
      throw new DOMException("cancelada", "AbortError");
    };
    await assert.rejects(consultar("/products"), { name: "AbortError" });
  } finally {
    globalThis.fetch = fetchOriginal;
    await servidor.close();
  }
});

test("Práctica: conserva saldo e historial y rechaza un canje sin puntos", async () => {
  const inicial = await consultarDemo("/user/me");
  await consultarDemo("/redeem", { productId: "auriculares" });
  assert.equal((await consultarDemo("/user/me")).points, inicial.points - 1200);
  assert.equal((await consultarDemo("/user/history")).length, 1);
  await assert.rejects(
    consultarDemo("/redeem", { productId: "monitor" }),
    /suficientes/,
  );
  assert.equal((await consultarDemo("/user/me")).points, inicial.points - 1200);
  await consultarDemo("/user/points", { amount: 1000 });
  assert.equal((await consultarDemo("/user/me")).points, inicial.points - 200);
  await assert.rejects(
    consultarDemo("/user/points", { amount: 123 }),
    /no permitida/,
  );
});
