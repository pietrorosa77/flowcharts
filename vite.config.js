import reactJsx from "vite-react-jsx";
import eslintPlugin from "vite-plugin-eslint";

export default {
  server: {
    port: 5678,
  },
  plugins: [reactJsx(), eslintPlugin()],
};
