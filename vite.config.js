import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Las rutas con # permiten publicar también en subcarpetas de GitHub Pages.
export default defineConfig({ plugins: [react()], base: "./" });
