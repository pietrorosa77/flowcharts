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

export const DefaultFont = {
  family: "'Sora',sans-serif",
  size: "14px",
  face: `/* latin-ext */
  @font-face {
    font-family: 'Sora';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url(https://fonts.gstatic.com/s/sora/v3/xMQOuFFYT72X5wkB_18qmnndmSdSnk-DKQJRBg.woff2) format('woff2');
    unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
  }
  /* latin */
  @font-face {
    font-family: 'Sora';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url(https://fonts.gstatic.com/s/sora/v3/xMQOuFFYT72X5wkB_18qmnndmSdSnk-NKQI.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }`,
};

export const EditorTheme: FlowchartTheme = deepMerge(base, {
  global: {
    colors: {
      ...FlowChartColors,
    },
    font: DefaultFont,
  },
  jsonEditor: {
    theme: "ocean" as ThemeKeys,
  },
  diagram: {
    canvasWidth: 3000,
    canvasHeight: 3000,
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
