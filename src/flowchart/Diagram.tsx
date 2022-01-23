import * as React from "react";
import { Node } from "./Node";
import { Link, NewLink } from "./Link";
import {
  IOnEndConnection,
  IOnNodeSelectionChanged,
  IOnAreaSelectionChanged,
  INode,
  IPort,
  IOnDragNodeStopEvent,
  IFlowchartState,
  SimpleChartAction,
  ChartMiddlewhare,
  Actions,
  DiagramEventArgs,
} from "./definitions";
import { PORT_OFFSET_Y } from "./Port";
import { ZoomLayer } from "./Zoom";
import { AreaSelect } from "./AreaSelect";
import styled from "styled-components";
import { nanoid } from "nanoid";
import { getNodeRenderer } from "./utils";
import { BottomCommands } from "./BottomCommands";
import { EventBusContext } from "./eventBus";
import { useChartReducer } from "./reducer";
import { cloneDeep } from "lodash";

export const CanvasOuter = styled.div<any>`
  position: relative;
  background-color: ${(props: any) =>
    props.theme.global.colors["canvasOuterBg"]};
  overflow: hidden;
  width: 100%;
  height: 100%;
` as any;

export const CanvasInner = styled.div`
  background-image: ${(props) => `
  linear-gradient(${props.theme.global.colors.canvasGridSquare} 2px, transparent 2px), 
  linear-gradient(90deg, ${props.theme.global.colors.canvasGridSquare} 2px, transparent 2px), 
  linear-gradient(${props.theme.global.colors.canvasGrid} 1px, transparent 1px), 
  linear-gradient(90deg, ${props.theme.global.colors.canvasGrid} 1px, transparent 1px);`};
  background-color: ${(props) => props.theme.global.colors["canvasBg"]};
  background-size: 50px 50px, 50px 50px, 10px 10px, 10px 10px;
  outline: 1px dashed rgba(0, 0, 0, 0.1);
  position: relative;
  width: ${(props) => props.theme.diagram.canvasWidth || 2000}px;
  height: ${(props) => props.theme.diagram.canvasHeight || 2000}px;
` as any;

interface IDiagramProps {
  highlighted?: Array<string>;
  nodeSize?: number;
  renderNode?: (node: INode) => JSX.Element;
  renderPort?: (port: IPort) => JSX.Element;
  sidebarOpened?: boolean;
  reducer: (
    state: IFlowchartState,
    action: SimpleChartAction
  ) => IFlowchartState;
  initialState: IFlowchartState;
  middlewares: ChartMiddlewhare[];
}

export const Diagram = (props: IDiagramProps) => {
  const bus = React.useContext(EventBusContext);
  const [canvasId] = React.useState<string>(nanoid(8));
  const canvas = React.createRef<HTMLDivElement>();
  const highlighted = props.highlighted || [];

  const [appState, dispatch] = useChartReducer(
    props.reducer,
    props.initialState,
    props.middlewares,
    bus
  );
  const chart = appState.chart;

  const onDiagramEvent = (type: Actions, payload: DiagramEventArgs) => {
    dispatch({ type, payload });
  };

  const onDeleteNodes = (evt: string[]) => {
    onNodeSettings(undefined);
    onDiagramEvent("onDeleteNodes", evt);
  };

  const onNodeUpdated = (evt: INode) => onDiagramEvent("onUpdateNode", evt);

  const onDragNodeStop = (evt: IOnDragNodeStopEvent) =>
    onDiagramEvent("onDragNodeStop", evt);

  const onNodeSelectionChanged = (evt: IOnNodeSelectionChanged) =>
    onDiagramEvent("onNodeSelectionChanged", evt);

  const onNodeSizeChanged = (evt: ResizeObserverEntry[]) => {
    console.log("ygygyg", evt);
    onDiagramEvent("onNodeSizeChanged", evt);
  };

  const onEndConnection = (evt: IOnEndConnection) =>
    onDiagramEvent("onEndConnection", evt);

  const onAreaSelectionChange = (evt: IOnAreaSelectionChanged) =>
    onDiagramEvent("onAreaSelectionChanged", evt);

  const onDeleteLink = (evt: string) => onDiagramEvent("onDeleteLink", evt);

  const onNodeAdded = (evt: INode) => onDiagramEvent("onNodeAdded", evt);

  const onUndo = () => onDiagramEvent("onUndo", undefined);

  const onRedo = () => onDiagramEvent("onRedo", undefined);

  const onNodeSettings = (evt: INode | undefined) => {
    bus.emit("evt-nodesettings", cloneDeep(evt));
  };

  React.useEffect(() => {
    const unsub = bus.subscribe("evt-nodessizechanged", onNodeSizeChanged);
    const nodeUpdt = bus.subscribe("evt-nodeupdated", onNodeUpdated);
    return () => {
      bus.unSubscribe("evt-nodessizechanged", unsub);
      bus.unSubscribe("evt-nodeupdated", nodeUpdt);
    };
    // eslint-disable-next-line
  }, []);

  const onNodeDelete = (id: string) => {
    onDeleteNodes([id]);
  };

  const renderNodes = () => {
    return Object.keys(chart.nodes).map((key) => (
      <Node
        key={key}
        maxNodeSize={props.nodeSize || 250}
        canvasId={canvasId}
        selected={chart.selected[key]}
        node={chart.nodes[key]}
        links={Object.keys(chart.links)
          .filter((k) => chart.links[k].from.nodeId === key)
          .map((linkId) => chart.links[linkId])}
        onNodeSelectionChanged={onNodeSelectionChanged}
        onDragNodeStop={onDragNodeStop}
        onNodeDelete={onNodeDelete}
        onEndConnection={onEndConnection}
        onNodeSettings={onNodeSettings}
        highlighted={highlighted.includes(key)}
        renderPort={props.renderPort}
      >
        {getNodeRenderer(chart.nodes[key], props.renderNode)}
      </Node>
    ));
  };

  const renderLinks = () => {
    return Object.keys(chart.links).map((key) => {
      const link = chart.links[key];

      return (
        <Link
          key={key}
          id={link.id}
          portHeight={PORT_OFFSET_Y}
          portFrom={link.from.portId}
          nodeFrom={chart.nodes[link.from.nodeId]}
          nodeTo={chart.nodes[link.to]}
          onDeleteLink={onDeleteLink}
        />
      );
    });
  };

  const onBlockDrop = (e: DragEvent) => {
    if (!e.dataTransfer || !canvas.current) {
      return;
    }
    const diagramData = e.dataTransfer.getData("DIAGRAM-BLOCK");
    const newNode = JSON.parse(diagramData) as INode;
    const canvasRect = canvas.current.getBoundingClientRect();

    const x =
      (e.clientX + canvas.current.scrollLeft - canvasRect.left) /
      bus.getDiagramZoomScale().scale;
    const y =
      (e.clientY + canvas.current.scrollTop - canvasRect.top) /
      bus.getDiagramZoomScale().scale;

    newNode.position = {
      x,
      y,
    };
    onNodeAdded(newNode);
  };

  const onDragOver = (e: MouseEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <CanvasOuter className="flowDiagramCanvasOuter" autoCenter>
        <ZoomLayer width="100%" height="100%">
          <AreaSelect
            onAreaSelectionChange={onAreaSelectionChange}
            nodes={chart.nodes}
          >
            <CanvasInner
              ref={canvas}
              id={canvasId}
              className="flowDiagramCanvasInner"
              onDrop={onBlockDrop}
              onDragOver={onDragOver}
            >
              {renderNodes()}
              {renderLinks()}
              <NewLink portHeight={PORT_OFFSET_Y} chart={chart} />
            </CanvasInner>
          </AreaSelect>
        </ZoomLayer>
      </CanvasOuter>
      <BottomCommands
        sidebarOpened={props.sidebarOpened}
        chart={chart}
        onDeleteNodes={onDeleteNodes}
        canRedo={appState.canRedo}
        canUndo={appState.canUndo}
        onRedo={onRedo}
        onUndo={onUndo}
      />
    </>
  );
};
