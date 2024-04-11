import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/boleto-utils.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
});
