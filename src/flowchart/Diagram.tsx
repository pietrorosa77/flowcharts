import * as React from "react";
import DiagramContext from "./Context";
import { Node } from "./Node";
import { Link } from "./Link";
import {
  IChart,
  IOnDragNodeEvent,
  IOnStartConnection,
  IOnEndConnection,
  IOnNodeSelectionChanged,
  IOnAreaSelectionChanged,
  INode,
  IOnNodeSizeChanged,
  IPort,
  IPosition,
  ILink,
} from "./definitions";
import { PORT_OFFSET_Y } from "./Port";
import { ZoomLayer } from "./Zoom";
import { AreaSelect } from "./AreaSelect";
import styled from "styled-components";
import { nanoid } from "nanoid";
import { getNodeRenderer } from "./utils";

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
  onDragNodeStop: (evt: IOnDragNodeEvent) => void;
  // onStartConnection: (evt: IOnStartConnection) => void;
  onEndConnection: (evt: IOnEndConnection) => void;
  onNodeSelectionCanged: (evt: IOnNodeSelectionChanged) => void;
  onAreaSelectionChange: (evt: IOnAreaSelectionChanged) => void;
  onNodeAdded: (evt: INode) => void;
  onNodeSizeChanged: (evt: IOnNodeSizeChanged) => void;
  onPanChange?: (x: number, y: number) => void;
  onDeleteLink: (id: string) => void;
  onNodeSettings: (node: INode) => void;
  onDeleteNodes: (ids: string[]) => void;
  renderNode?: (node: INode) => JSX.Element;
  renderPort?: (port: IPort) => JSX.Element;
}

export const Diagram = (props: IDiagramProps) => {
  const [canvasId] = React.useState<string>(nanoid(8));
  const [newLink, setNewLink] = React.useState<ILink>();
  const chart = props.chart;
  const canvas = React.createRef<HTMLDivElement>();
  const diagramContext = React.useContext(DiagramContext);
  const panZoomData = diagramContext
    ? { x: diagramContext.x, y: diagramContext.y, scale: diagramContext.scale }
    : { x: 0, y: 0, scale: 1 };
  const highlighted = props.highlighted || [];

  const onNodeDelete = (id: string) => {
    props.onDeleteNodes([id]);
  };

  const onStartConnection = (evt: IOnStartConnection) => {
    setNewLink(evt.newLink);
  };

  const onEndConnection = (evt: IOnEndConnection) => {
    setNewLink(undefined);
    props.onEndConnection(evt);
  };

  const renderNodes = () => {
    return Object.keys(chart.nodes).map((key) => (
      <Node
        key={key}
        maxNodeSize={props.nodeSize || 250}
        canvasId={canvasId}
        selected={chart.selected[key] ? true : false}
        node={chart.nodes[key]}
        links={Object.keys(chart.links)
          .filter((k) => chart.links[k].from.nodeId === key)
          .map((linkId) => chart.links[linkId])}
        onNodeSelectionCanged={props.onNodeSelectionCanged}
        onDragNodeStop={props.onDragNodeStop}
        onNodeSizeChanged={props.onNodeSizeChanged}
        onNodeDelete={onNodeDelete}
        onStartConnection={onStartConnection}
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

  const renderNewLink = () => {
    if (!newLink) return null;
    return (
      <Link
        portHeight={PORT_OFFSET_Y}
        id={newLink.id}
        portFrom={newLink.from.portId}
        nodeFrom={chart.nodes[newLink.from.nodeId]}
        nodeTo={{
          id: "fakeNode",
          position: newLink.posTo as IPosition,
          content: "",
          title: "",
          ports: {},
        }}
        creating
      />
    );
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
      panZoomData.scale;
    const y =
      (e.clientY + canvas.current.scrollTop - canvasRect.top) /
      panZoomData.scale;

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
    <CanvasOuter className="flowDiagramCanvasOuter" autoCenter>
      <ZoomLayer
        width="100%"
        height="100%"
        x={panZoomData.x}
        y={panZoomData.y}
        zoom={panZoomData.scale}
        onPan={props.onPanChange}
      >
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
            {renderNewLink()}
          </CanvasInner>
        </AreaSelect>
      </ZoomLayer>
    </CanvasOuter>
  );
};
