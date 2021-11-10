import * as React from "react";
import {
  getMultiselectionSquareRectOffsets,
  getPositionWithParentBoundsSize,
} from "./utils";
import { INode, IOnDragNodeEvent } from "./definitions";
import styled from "styled-components";

export interface INodeDraggerProps {
  children: any;
  node: INode;
  scale: number;
  parentBoundId: string;
  cursor?: string;
  selected?: boolean;
  onDrag: (evt: IOnDragNodeEvent) => void;
  onDragEnd: (evt: IOnDragNodeEvent) => void;
}


const DragContainerBordersDragging= styled.div`
  border-radius: 12px;
  border: 2px solid ${(props) => props.theme.global.colors["accent-1"]} !important;
`;

const DragContainerBorders = styled.div`
  border-radius: 12px;
  border: 2px solid ${(props) => props.theme.global.colors["light-1"]};
  &:hover {
    border: 2px solid ${(props) => props.theme.global.colors["accent-1"]};
  }
`;

export function NodeDragger(props: INodeDraggerProps) {
  const position = props.node.position;
  const node = props.node;
  const Borders = React.useRef(DragContainerBorders);
  const DraggingBorders = React.useRef(DragContainerBordersDragging);
  const [dragging, setDragging] = React.useState(false);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas: HTMLDivElement = document.getElementById(
      props.parentBoundId
    ) as any;

    const domeNode: HTMLDivElement = document.getElementById(
      `${node.id}-drag-hat`
    ) as any;

    const canvasRect = canvas.getBoundingClientRect();
    const nodeRect = domeNode.getBoundingClientRect();
    const scale: number = props.scale || 1;
    const canvasSize = {
      w: canvasRect.width / scale,
      h: canvasRect.height / scale,
    };
    const nodeSize = { w: nodeRect.width / scale, h: nodeRect.height / scale };
    const multiSelectOffsets: any = getMultiselectionSquareRectOffsets(scale);

    // initial offset of pointer comapred to node position
    const mouseOffsetToNode = {
      x: e.clientX - nodeRect.x,
      y: e.clientY - nodeRect.y,
    };

    const scrollLeft =  canvas.scrollLeft;
    const rectTop = canvasRect.top; 
    const rectLeft = canvasRect.left;
    const scrollTop = canvas.scrollTop;

    e.preventDefault();
    e.stopPropagation();

    const mouseMoveHandler = (e: MouseEvent) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.cancelBubble = true;

      const x =
        (e.clientX +
          scrollLeft -
          rectLeft -
          mouseOffsetToNode.x) /
        scale;
      const y =
        (e.clientY + scrollTop - rectTop - mouseOffsetToNode.y) /
        scale;

      const finalPosition = getPositionWithParentBoundsSize(
        canvasSize,
        nodeSize,
        multiSelectOffsets[`${props.node.id}-drag-hat`] as any,
        x,
        y
      );

      requestAnimationFrame(() =>
        props.onDrag({
          node: props.node,
          position: finalPosition,
          canvasSize,
          multiSelectOffsets,
        })
      );
    };

    const throttledMove = (e: any) => requestAnimationFrame(() => mouseMoveHandler(e))

    const mouseUpHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      window.removeEventListener("mouseup", mouseUpHandler, false);
      window.removeEventListener("mousemove", throttledMove, true);
      props.onDragEnd({ node, position, canvasSize, multiSelectOffsets });
    };

    setDragging(true);
    props.onDrag({
      node: props.node,
      position,
      canvasSize,
      multiSelectOffsets,
    });
    window.addEventListener("mouseup", mouseUpHandler, false);
    window.addEventListener("mousemove", throttledMove, {
      capture: true,
      passive: true,
    });
  };

  const className = props.selected
    ? `flowDiagramNodeDraggerHat drag-hat-selected`
    : `flowDiagramNodeDraggerHat`;

  const BordersC = dragging ? DraggingBorders.current : Borders.current;
  return (
    <div
      className={className}
      key={`${node.id}-drag-hat`}
      id={`${node.id}-drag-hat`}
      onMouseDown={onMouseDown}
      style={{
        position:"absolute",
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor:"move",
        zIndex: dragging? 110 : 100
      }}
    >
      <BordersC>{props.children}</BordersC>
    </div>
  );
}
