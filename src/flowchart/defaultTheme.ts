import { deepMerge } from "grommet/utils";
import { base, ThemeType } from "grommet/themes";
import { ThemeKeys } from "react-json-view";

export const FlowChartColors = {
  focus: "cornflowerblue",
  hide: "transparent",
  canvasBg: "#3a5584",
  canvasOuterBg: "#3a5584",
  canvasGrid: "rgba(81, 203, 238, 0.1)",
  canvasGridSquare: "rgba(81, 203, 238, 0.1)",
  connection: "cornflowerblue",
  "accent-1": "rgba(81, 203, 238, 1)",
  nodehighlight: "#6FFFB0",
  bars: "#2b2e4b",
  brand: "#4a4d70",
  options: "#7D4CDB",
  white: "#fff",
  black: "#000",
};

export type FlowchartTheme = ThemeType & {
  jsonEditor?: {
    theme: ThemeKeys;
  };
  diagram?: {
    canvasWidth: number;
    canvasHeight: number;
  };
};

export const EditorTheme: FlowchartTheme = deepMerge(base, {
  global: {
    colors: {
      ...FlowChartColors,
    },
    font: {
      family: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
      "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
      sans-serif`,
      size: "14px",
    },
  },
  jsonEditor: {
    theme: "ocean" as ThemeKeys,
  },
  diagram: {
    canvasWidth: 2000,
    canvasHeight: 2000,
  },
  tip: {
    drop: {
      background: { color: "transparent", opacity: 0 },
      margin: "none",
      round: "medium",
      elevation: "none",
      style: {
        color: `${FlowChartColors["accent-1"]}`,
      },
    },
    content: {
      elevation: "none",
      background: "none",
      pad: "none",
    },
  },
});
