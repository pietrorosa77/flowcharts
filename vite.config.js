import reactJsx from "vite-react-jsx";
import eslintPlugin from "vite-plugin-eslint";

export default {
  plugins: [reactJsx(), eslintPlugin()],
};
