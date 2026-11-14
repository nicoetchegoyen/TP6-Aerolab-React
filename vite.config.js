import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { handler } from "./netlify/functions/aerolab.mjs";

// Las rutas con # permiten publicar también en subcarpetas de GitHub Pages.
export default defineConfig(({ mode }) => {
  const entorno = loadEnv(mode, process.cwd(), "");
  // Sólo Node lee estas variables; no se envían a React.
  process.env.AEROLAB_TOKEN = entorno.AEROLAB_TOKEN || "";
  process.env.AEROLAB_ACTION_KEY = entorno.AEROLAB_ACTION_KEY || "";
  return {
    base: "./",
    plugins: [
      react(),
      {
        name: "funcion-aerolab-local",
        configureServer(servidor) {
          servidor.middlewares.use(async (req, res, next) => {
            const url = new URL(req.url, "http://localhost");
            if (url.pathname !== "/.netlify/functions/aerolab") return next();
            let body = "";
            for await (const fragmento of req) {
              body += fragmento;
              if (body.length > 2048) {
                res.writeHead(413);
                res.end();
                return;
              }
            }
            const resultado = await handler({
              httpMethod: req.method,
              headers: req.headers,
              queryStringParameters: Object.fromEntries(url.searchParams),
              body,
            });
            res.writeHead(resultado.statusCode, resultado.headers);
            res.end(resultado.body);
          });
        },
      },
    ],
  };
});
