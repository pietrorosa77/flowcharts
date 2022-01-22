import * as React from "react";
import { Node } from "./Node";
import { Link, NewLink } from "./Link";
import {
  IChart,
  IOnEndConnection,
  IOnNodeSelectionChanged,
  IOnAreaSelectionChanged,
  INode,
  IOnNodeSizeChanged,
  IPort,
  IOnDragNodeStopEvent,
} from "./definitions";
import { PORT_OFFSET_Y } from "./Port";
import { ZoomLayer } from "./Zoom";
import { AreaSelect } from "./AreaSelect";
import styled from "styled-components";
import { nanoid } from "nanoid";
import { getNodeRenderer } from "./utils";
import { BottomCommands } from "./BottomCommands";
import { EventBusContext } from "./eventBus";

export const CanvasOuter = styled.div<any>`
  position: relative;
  background-color: ${(props: any) =>
    props.theme.global.colors["canvasOuterBg"]};
  overflow: hidden;
  width: 100%;
  height: 100%;
` as any;

export const CanvasInner = styled.div`
  box-shadow: ${(props) =>
    `0 0 90px -9px ${props.theme.global.colors["light-1"]};`};
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
  chart: IChart;
  highlighted?: Array<string>;
  nodeSize?: number;
  onDragNodeStop: (evt: IOnDragNodeStopEvent) => void;
  onEndConnection: (evt: IOnEndConnection) => void;
  onNodeSelectionChanged: (evt: IOnNodeSelectionChanged) => void;
  onAreaSelectionChange: (evt: IOnAreaSelectionChanged) => void;
  onNodeAdded: (evt: INode) => void;
  onNodeSizeChanged: (evt: IOnNodeSizeChanged) => void;
  onDeleteLink: (id: string) => void;
  onNodeSettings: (node: INode) => void;
  onDeleteNodes: (ids: string[]) => void;
  renderNode?: (node: INode) => JSX.Element;
  renderPort?: (port: IPort) => JSX.Element;
  sidebarOpened?: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

export const Diagram = (props: IDiagramProps) => {
  const bus = React.useContext(EventBusContext);
  const [canvasId] = React.useState<string>(nanoid(8));
  const chart = props.chart;
  const canvas = React.createRef<HTMLDivElement>();
  const highlighted = props.highlighted || [];

  const onNodeDelete = (id: string) => {
    props.onDeleteNodes([id]);
  };

  const onEndConnection = (evt: IOnEndConnection) => {
    props.onEndConnection(evt);
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
        onNodeSelectionChanged={props.onNodeSelectionChanged}
        onDragNodeStop={props.onDragNodeStop}
        onNodeSizeChanged={props.onNodeSizeChanged}
        onNodeDelete={onNodeDelete}
        onEndConnection={onEndConnection}
        onNodeSettings={props.onNodeSettings}
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
          onDeleteLink={props.onDeleteLink}
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
    props.onNodeAdded(newNode);
  };

  const onDragOver = (e: MouseEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <CanvasOuter className="flowDiagramCanvasOuter" autoCenter>
        <ZoomLayer width="100%" height="100%">
          <AreaSelect
            onAreaSelectionChange={props.onAreaSelectionChange}
            nodes={props.chart.nodes}
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
              <NewLink portHeight={PORT_OFFSET_Y} chart={props.chart} />
            </CanvasInner>
          </AreaSelect>
        </ZoomLayer>
      </CanvasOuter>
      <BottomCommands
        sidebarOpened={props.sidebarOpened}
        chart={props.chart}
        onDeleteNodes={props.onDeleteNodes}
        canRedo={props.canRedo}
        canUndo={props.canUndo}
      />
    </>
  );
};
