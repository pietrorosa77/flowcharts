import * as React from "react";
import { Diagram } from "./Diagram";
import DiagramContext from "./Context";
import {
  Actions,
  DiagramEventArgs,
  ExtendedNode,
  IChart,
  IFlowchartState,
  INode,
  INodePanelEditor,
  IOnAreaSelectionChanged,
  IOnDragNodeEvent,
  IOnEndConnection,
  IOnNodeSelectionChanged,
  IOnNodeSizeChanged,
  IPort,
} from "./definitions";
import { Box, Grommet } from "grommet";
import { reducer, getInitialState } from "./reducer";
import { Sidebar } from "./Sidebar";
import { PropertyPanel } from "./PropertyPanel";
import { BottomCommands } from "./BottomCommands";
import { EditorTheme, FlowchartTheme } from "./defaultTheme";
import { deepMerge } from "grommet/utils";
import { useFlowchartReducer } from "./useFlowchartReducer";
import { cloneDeep } from "lodash";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  .flowDiagramNodeDraggerHatBorders {
    &:hover {
      border-color: ${(props) =>
        (props.theme as any).global.colors["accent-1"]} !important;
    }
  }
`;

export interface IFlowChartProps {
  chart: IChart;
  name: string;
  sidebarButtons: ExtendedNode[] | {
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
  onLoadPropertyPanel?: (
    node: INode
  ) => Promise<
    React.LazyExoticComponent<React.ComponentType<INodePanelEditor>>
  >;
  renderNode?: (node: INode) => JSX.Element;
  renderPort?: (port: IPort) => JSX.Element;
  nodePropertiesValidator?: (newProps: { [key: string]: any }) => {
    error: string | undefined;
  };
  portPropertiesValidator?: (newProps: { [key: string]: any }) => {
    error: string | undefined;
  };
  onDiagramChanging?: (
    state: IFlowchartState,
    type: Actions,
    payload: DiagramEventArgs
  ) => void;
  onDiagramChanged?: (state: IFlowchartState, type: Actions) => void;
  sidebarInitiallyOpened?: boolean;
}

const getTheme = (theme?: FlowchartTheme) => {
  return theme ? deepMerge(EditorTheme, theme) : EditorTheme;
};

export default function FlowDiagramEditor(props: IFlowChartProps) {
  const onAppStateChanging = (
    state: IFlowchartState,
    type: Actions,
    payload: DiagramEventArgs
  ) => {
    if (props.onDiagramChanging) {
      props.onDiagramChanging(state, type, payload);
    }
  };

  const onAppStateChanged = (state: IFlowchartState, type: Actions) => {
    if (props.onDiagramChanged) {
      props.onDiagramChanged(state, type);
    }
  };

  const [sidebarOpened, setSidebarOpened] = React.useState(
    props.sidebarInitiallyOpened
  );
  const [panelSettings, setPanelSettings] = React.useState<INode>();
  const [panZoomData, setPanZoomData] = React.useState({
    x: 0,
    y: 0,
    scale: 1,
    minZoom: 0.1,
    maxZoom: 2,
  });
  const [appState, dispatch] = useFlowchartReducer(
    reducer,
    getInitialState(props.chart, props.name),
    onAppStateChanging,
    onAppStateChanged
  );
  const [theme, setTheme] = React.useState(getTheme(props.theme));
  const highLightNodes = panelSettings ? [panelSettings.id] : [];

  React.useEffect(() => {
    setTheme(getTheme(props.theme));
  }, [props.theme]);

  const onDiagramEvent = (type: Actions, payload: DiagramEventArgs) => {
    dispatch({ type, payload });
  };

  const nodePropertiesValidator =
    props.nodePropertiesValidator || (() => ({ error: undefined }));
  const portPropertiesValidator =
    props.portPropertiesValidator || (() => ({ error: undefined }));

  const toggleSidebar = () => {
    setSidebarOpened(!sidebarOpened);
  };

  const closePanelSettings = () => {
    setPanelSettings(undefined);
  };

  const openPanelSettings = (node: INode) => {
    setPanelSettings(cloneDeep(node));
  };

  const onPanChange = (x: number, y: number) => {
    setPanZoomData({
      ...panZoomData,
      x,
      y,
    });
  };

  const onZoomIn = () => {
    setPanZoomData({
      ...panZoomData,
      scale: panZoomData.scale + 0.2,
    });
  };

  const onZoomOut = () => {
    setPanZoomData({
      ...panZoomData,
      scale: panZoomData.scale - 0.1,
    });
  };

  const onZoomReset = () => {
    setPanZoomData({
      ...panZoomData,
      x: 0,
      y: 0,
      scale: 1,
    });
  };

  const onDeleteNodes = (evt: string[]) => {
    if (panelSettings && evt.includes(panelSettings.id)) {
      closePanelSettings();
    }
    onDiagramEvent("onDeleteNodes", evt);
  };

  const onUndo = () => onDiagramEvent("onUndo", {});

  const onRedo = () => onDiagramEvent("onRedo", {});

  const onNodeUpdated = (evt: INode) => onDiagramEvent("onUpdateNode", evt);

  const onDragNodeStop = (evt: IOnDragNodeEvent) =>
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
      theme={theme}
      full
      style={{
        overflow: "hidden",
        width: props.width,
        height: props.height,
      }}
    >
      <GlobalStyle />
      <DiagramContext.Provider value={panZoomData}>
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
              onClose={toggleSidebar}
              opened={sidebarOpened}
            />
            <PropertyPanel
              width="500px"
              nodePropertiesValidator={nodePropertiesValidator}
              portPropertiesValidator={portPropertiesValidator}
              renderNode={props.renderNode}
              renderPort={props.renderPort}
              node={panelSettings}
              onClose={closePanelSettings}
              onNodeUpdated={onNodeUpdated}
              customData={props.customData}
              onLoadPropertyPanel={props.onLoadPropertyPanel}
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
              onPanChange={onPanChange}
              onNodeAdded={onNodeAdded}
            />
            <BottomCommands
              sidebarOpened={sidebarOpened}
              maxZoom={panZoomData.maxZoom}
              minZoom={panZoomData.minZoom}
              chart={appState.chart}
              onRedo={onRedo}
              onUndo={onUndo}
              onZoomIn={onZoomIn}
              onZoomOut={onZoomOut}
              onZoomReset={onZoomReset}
              onDeleteNodes={onDeleteNodes}
              toggleSidebar={toggleSidebar}
              canRedo={appState.canRedo}
              canUndo={appState.canUndo}
            />
          </Box>
        </Box>
      </DiagramContext.Provider>
    </Grommet>
  );
}
