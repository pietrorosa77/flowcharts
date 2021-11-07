import * as React from "react";
import { Diagram } from "./Diagram";
import DiagramContext from "./Context";
import {
  Actions,
  DiagramEventArgs,
  ExtendedNode,
  IChart,
  IDiagramContext,
  IFlowchartState,
  INode,
  INodePanelEditor,
  IOnAreaSelectionChanged,
  IOnDragNodeEvent,
  IOnEndConnection,
  IOnNodeSelectionChanged,
  IOnNodeSizeChanged,
  IOnStartConnection,
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

export interface IFlowChartProps {
  chart: IChart;
  name: string;
  sidebarButtons: ExtendedNode[];
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
  onPanZoomChange?: (evt: IDiagramContext) => void;
  onDiagramChanging?: (
    state: IFlowchartState,
    type: Actions,
    payload: DiagramEventArgs
  ) => void;
  onDiagramChanged?: (state: IFlowchartState, type: Actions) => void;
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

  const [appState, dispatch, history] = useFlowchartReducer(
    reducer,
    getInitialState(props.chart, props.name),
    onAppStateChanging,
    onAppStateChanged,
    50
  );

  const [theme, setTheme] = React.useState(EditorTheme);
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

  return (
    <Grommet
      theme={theme}
      full
      style={{
        overflow: "hidden",
        width: props.width || undefined,
        height: props.height || undefined,
      }}
    >
      <DiagramContext.Provider value={appState.panZoomData}>
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
              onClose={() => onDiagramEvent("toggleSidebar", {})}
              opened={appState.uiState.sidebarOpened}
            />
            <PropertyPanel
              width="500px"
              nodePropertiesValidator={nodePropertiesValidator}
              portPropertiesValidator={portPropertiesValidator}
              renderNode={props.renderNode}
              renderPort={props.renderPort}
              node={appState.uiState.propertyPane}
              onClose={() => onDiagramEvent("onNodeSettings", undefined)}
              onNodeUpdated={(evt: any) => onDiagramEvent("onUpdateNode", evt)}
              customData={props.customData}
              onLoadPropertyPanel={props.onLoadPropertyPanel}
            />
            <Diagram
              nodeSize={props.nodeSize}
              chart={appState.chart}
              renderNode={props.renderNode}
              renderPort={props.renderPort}
              highlighted={
                appState.uiState.propertyPane
                  ? [appState.uiState.propertyPane.id]
                  : []
              }
              onDragNode={(evt: IOnDragNodeEvent) =>
                onDiagramEvent("onDragNode", evt)
              }
              onDragNodeStop={(evt: IOnDragNodeEvent) =>
                onDiagramEvent("onDragNodeStop", evt)
              }
              onStartConnection={(evt: IOnStartConnection) =>
                onDiagramEvent("onStartConnection", evt)
              }
              onNodeSelectionCanged={(evt: IOnNodeSelectionChanged) =>
                onDiagramEvent("onNodeSelectionChanged", evt)
              }
              onNodeSizeChanged={(evt: IOnNodeSizeChanged) =>
                onDiagramEvent("onNodeSizeChanged", evt)
              }
              onEndConnection={(evt: IOnEndConnection) => {
                return onDiagramEvent("onEndConnection", evt);
              }}
              onAreaSelectionChange={(evt: IOnAreaSelectionChanged) =>
                onDiagramEvent("onAreaSelectionChanged", evt)
              }
              onNodeSettings={(evt: INode) =>
                onDiagramEvent("onNodeSettings", evt)
              }
              onDeleteNodes={(evt: string[]) =>
                onDiagramEvent("onDeleteNodes", evt)
              }
              onDeleteLink={(evt: string) =>
                onDiagramEvent("onDeleteLink", evt)
              }
              onPanChange={(x: number, y: number) => {
                onDiagramEvent("onPanChange", { x, y });
              }}
              onNodeAdded={(evt: INode) => onDiagramEvent("onNodeAdded", evt)}
            />
            <BottomCommands
              sidebarOpened={appState.uiState.sidebarOpened}
              maxZoom={appState.panZoomData.maxZoom}
              minZoom={appState.panZoomData.minZoom}
              chart={appState.chart}
              onRedo={() => onDiagramEvent("onRedo", { chart: history.redo() })}
              onUndo={() => onDiagramEvent("onUndo", { chart: history.undo() })}
              onZoomIn={() => onDiagramEvent("onZoomIn", {})}
              onZoomOut={() => onDiagramEvent("onZoomOut", {})}
              onZoomReset={() => onDiagramEvent("onZoomReset", {})}
              onDeleteNodes={(evt: string[]) =>
                onDiagramEvent("onDeleteNodes", evt)
              }
              toggleSidebar={() => onDiagramEvent("toggleSidebar", {})}
              canRedo={history.canRedo()}
              canUndo={history.canUndo()}
            />
          </Box>
        </Box>
      </DiagramContext.Provider>
    </Grommet>
  );
}
