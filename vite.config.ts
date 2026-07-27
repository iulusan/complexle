import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vite";

// Static GitHub Pages build of the same game engine the Express server uses (see
// src/client/main.ts for what's actually different between the two: no server round-trips,
// localStorage instead of a session cookie, and a client-side daily-target pick).
export default defineConfig({
  root: path.resolve(__dirname, "src/client"),
  base: "/complexle/",
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      // gameService.ts imports Node's randomUUID from "crypto" — this repo file is shared
      // verbatim with the server, so the browser bundle gets a matching browser implementation
      // instead, rather than forking gameService.ts itself.
      crypto: path.resolve(__dirname, "src/client/shims/crypto.ts"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist-client"),
    emptyOutDir: true,
  },
});
