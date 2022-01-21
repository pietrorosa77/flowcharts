import * as React from "react";
import { Diagram } from "./Diagram";
import {
  Actions,
  ChartMiddlewhare,
  DiagramEventArgs,
  ExtendedNode,
  IChart,
  IFlowchartState,
  INode,
  INodePanelEditor,
  IOnAreaSelectionChanged,
  IOnDragNodeStopEvent,
  IOnEndConnection,
  IOnNodeSelectionChanged,
  IOnNodeSizeChanged,
  IPort,
  SimpleChartAction,
} from "./definitions";
import { Box, Grommet } from "grommet";
import {
  createReducer,
  DispatcherContext,
  getInitialState,
  useChartReducer,
} from "./reducer";
import { Sidebar } from "./Sidebar";
import { PropertyPanel } from "./PropertyPanel";
import { EditorTheme, FlowchartTheme } from "./defaultTheme";
import { deepMerge } from "grommet/utils";
import { cloneDeep } from "lodash";
import { createGlobalStyle } from "styled-components";
import { useEventBus } from "./eventBus";
import {
  eventBusMiddleware,
  logMiddleware,
  thunkMiddleware,
} from "./middlewares";

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
`;

function InnerFlowChart(props: IInnerChartProps) {
  const [panelSettings, setPanelSettings] = React.useState<ExtendedNode>();

  const ChartEventBus = useEventBus();
  const [appState, dispatch] = useChartReducer(
    props.reducer,
    props.initialState,
    props.middlewares,
    ChartEventBus
  );

  const highLightNodes = panelSettings ? [panelSettings.id] : [];

  const onDiagramEvent = (type: Actions, payload: DiagramEventArgs) => {
    dispatch({ type, payload });
  };

  const closePanelSettings = () => {
    setPanelSettings(undefined);
  };

  const openPanelSettings = (node: INode) => {
    setPanelSettings(cloneDeep(node));
  };

  const onDeleteNodes = (evt: string[]) => {
    if (panelSettings && evt.includes(panelSettings.id)) {
      closePanelSettings();
    }
    onDiagramEvent("onDeleteNodes", evt);
  };

  const onNodeUpdated = (evt: INode) => onDiagramEvent("onUpdateNode", evt);

  const onDragNodeStop = (evt: IOnDragNodeStopEvent) =>
    onDiagramEvent("onDragNodeStop", evt);

  const onNodeSelectionChanged = (evt: IOnNodeSelectionChanged) =>
    onDiagramEvent("onNodeSelectionChanged", evt);

  const onNodeSizeChanged = (evt: IOnNodeSizeChanged) =>
    onDiagramEvent("onNodeSizeChanged", evt);

  const onEndConnection = (evt: IOnEndConnection) =>
    onDiagramEvent("onEndConnection", evt);

  const onAreaSelectionChange = (evt: IOnAreaSelectionChanged) =>
    onDiagramEvent("onAreaSelectionChanged", evt);

  const onDeleteLink = (evt: string) => onDiagramEvent("onDeleteLink", evt);

  const onNodeAdded = (evt: INode) => onDiagramEvent("onNodeAdded", evt);

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
      <DispatcherContext.Provider
        value={{ dispatcher: dispatch, bus: ChartEventBus }}
      >
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
              node={panelSettings}
              onClose={closePanelSettings}
              onNodeUpdated={onNodeUpdated}
              customData={props.customData}
              renderNode={props.renderNode}
              renderPort={props.renderPort}
              nodePropertiesValidator={props.nodePropertiesValidator}
              portPropertiesValidator={props.portPropertiesValidator}
              customEditors={props.customEditors}
            />
            <Diagram
              nodeSize={props.nodeSize}
              chart={appState.chart}
              renderNode={props.renderNode}
              renderPort={props.renderPort}
              highlighted={highLightNodes}
              onDragNodeStop={onDragNodeStop}
              onNodeSelectionChanged={onNodeSelectionChanged}
              onNodeSizeChanged={onNodeSizeChanged}
              onEndConnection={onEndConnection}
              onAreaSelectionChange={onAreaSelectionChange}
              onNodeSettings={openPanelSettings}
              onDeleteNodes={onDeleteNodes}
              onDeleteLink={onDeleteLink}
              onNodeAdded={onNodeAdded}
              sidebarOpened={props.sidebarInitiallyOpened}
              canRedo={appState.canRedo}
              canUndo={appState.canUndo}
            />
          </Box>
        </Box>
      </DispatcherContext.Provider>
    </Grommet>
  );
}

export default function FlowChart(props: IFlowchartProps) {
  const theme = props.theme ? deepMerge(EditorTheme, props.theme) : EditorTheme;
  const reducer = createReducer();
  const baseMiddlewares = [thunkMiddleware, eventBusMiddleware];
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
