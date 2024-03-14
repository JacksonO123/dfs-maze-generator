import { defineConfig } from "vite";
import pulse from "@jacksonotto/vite-plugin-pulse";

export default defineConfig({
  plugins: [pulse()],
});
