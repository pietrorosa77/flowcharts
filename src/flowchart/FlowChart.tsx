import * as React from "react";
import { Diagram } from "./Diagram";
import {
  Actions,
  ChartMiddlewhare,
  ExtendedNode,
  IChart,
  IFlowchartState,
  INode,
  INodePanelEditor,
  IPort,
  SimpleChartAction,
} from "./definitions";
import { Box, Grommet } from "grommet";
import { createReducer, getInitialState } from "./reducer";
import { Sidebar } from "./Sidebar";
import { PropertyPanel } from "./PropertyPanel";
import { EditorTheme, FlowchartTheme } from "./defaultTheme";
import { deepMerge } from "grommet/utils";
import { createGlobalStyle } from "styled-components";
import { EventBusContext, createBus } from "./eventBus";
import { logMiddleware, thunkMiddleware } from "./middlewares";

interface IFlowChartBaseProps {
  sidebarButtons:
    | ExtendedNode[]
    | {
        id: string;
        title: string;
        icon: string;
        getNode: () => ExtendedNode;
      }[];
  width?: string;
  height?: string;
  theme?: FlowchartTheme;
  customData?: { [key: string]: any };
  nodeSize?: number;
  renderNode?: (node: INode) => JSX.Element;
  renderPort?: (port: IPort) => JSX.Element;
  nodePropertiesValidator?: (newProps: { [key: string]: any }) => {
    error: string | undefined;
  };
  portPropertiesValidator?: (newProps: { [key: string]: any }) => {
    error: string | undefined;
  };
  onDiagramChanged?: (state: IFlowchartState, type: Actions) => void;
  sidebarInitiallyOpened?: boolean;
  customEditors?: Map<string, (props: INodePanelEditor) => JSX.Element>;
}

interface IFlowchartProps extends IFlowChartBaseProps {
  middlewares?: ChartMiddlewhare[];
  log?: boolean;
  chart: IChart;
  name: string;
}

interface IInnerChartProps extends IFlowChartBaseProps {
  reducer: (
    state: IFlowchartState,
    action: SimpleChartAction
  ) => IFlowchartState;
  initialState: IFlowchartState;
  middlewares: ChartMiddlewhare[];
}

const GlobalStyle = createGlobalStyle`
  .dumbot-flowchart-main {
    * {
      font-family: ${(props: any) =>
        props.theme.global.font?.family || "unset"};
    }
  }
  .flowDiagramNodeContainer {
    * {
    font-size: ${(props: any) =>
      props.theme.global.font?.size || "unset"} !important;
    }

  }
  .flowDiagramNodeDraggerHatBorders {

    &:hover {
      border-color: ${(props) =>
        (props.theme as any).global.colors["accent-1"]} !important;
    }
  }
  .flowDiagramNodeActionIcon {
    &:hover {
      stroke: ${(props) =>
        (props.theme as any).global.colors["accent-1"]} !important;
    }
  }
  .flowDiagramButtonBarAction {
    cursor: pointer;
    &.inactive {
      cursor: not-allowed;
      stroke: ${(props) =>
        (props.theme as any).global.colors["dark-2"]} !important;
      fill: ${(props) =>
        (props.theme as any).global.colors["dark-2"]} !important;
    }

    &.off {
      stroke: ${(props) => (props.theme as any).global.colors["light-6"]};
      fill: ${(props) => (props.theme as any).global.colors["light-6"]};
    }

    &.on,
    &:hover {
      stroke: ${(props) => (props.theme as any).global.colors["accent-1"]};
      fill: ${(props) => (props.theme as any).global.colors["accent-1"]};

    }
  }
`;

const ChartEventBus = createBus();

function InnerFlowChart(props: IInnerChartProps) {
  return (
    <Grommet
      theme={props.theme}
      className="dumbot-flowchart-main"
      full
      style={{
        overflow: "hidden",
        width: props.width,
        height: props.height,
      }}
    >
      <GlobalStyle />
      <EventBusContext.Provider value={ChartEventBus}>
        <Box
          direction="row"
          style={{ touchAction: "none", position: "relative" }}
          overflow="hidden"
          className="mainDiagramContainer"
          width="100%"
          height="100%"
        >
          <Box direction="column" overflow="hidden" width="100%" height="100%">
            <Sidebar
              buttons={props.sidebarButtons}
              width="250px"
              initiallyOpened={props.sidebarInitiallyOpened}
            />
            <PropertyPanel
              width="500px"
              customData={props.customData}
              renderNode={props.renderNode}
              renderPort={props.renderPort}
              nodePropertiesValidator={props.nodePropertiesValidator}
              portPropertiesValidator={props.portPropertiesValidator}
              customEditors={props.customEditors}
            />
            <Diagram
              nodeSize={props.nodeSize}
              renderNode={props.renderNode}
              renderPort={props.renderPort}
              sidebarOpened={props.sidebarInitiallyOpened}
              middlewares={props.middlewares}
              initialState={props.initialState}
              reducer={props.reducer}
            />
          </Box>
        </Box>
      </EventBusContext.Provider>
    </Grommet>
  );
}

export default function FlowChart(props: IFlowchartProps) {
  const theme = props.theme ? deepMerge(EditorTheme, props.theme) : EditorTheme;
  const reducer = createReducer();
  const baseMiddlewares = [thunkMiddleware];
  if (props.log) {
    baseMiddlewares.push(logMiddleware);
  }
  const middlewares = (props.middlewares || []).concat(baseMiddlewares);
  const initialState = getInitialState(props.chart, props.name);

  return (
    <InnerFlowChart
      {...props}
      initialState={initialState}
      middlewares={middlewares}
      theme={theme}
      reducer={reducer}
    />
  );
}
