import * as React from "react";
import {
  getMultiselectionSquareRectOffsets,
  getPositionWithParentBoundsSize,
} from "./utils";
import {
  INode,
  IOnNodeDragEvent,
  IOnDragNodeStopEvent,
  IPosition,
} from "./definitions";
import { ThemeContext } from "grommet";
import { EventBusContext } from "./eventBus";

export interface INodeDraggerProps {
  children: any;
  node: INode;
  parentBoundId: string;
  cursor?: string;
  selected?: boolean;
  onDragEnd: (evt: IOnDragNodeStopEvent) => void;
}

export function NodeDragger(props: INodeDraggerProps) {
  const fromPropsPosition = props.node.position;
  const draggedPosition = React.useRef(fromPropsPosition);
  const theme: any = React.useContext(ThemeContext);
  const bus = React.useContext(EventBusContext);
  const node = props.node;
  const bordersStyle = React.useRef<React.CSSProperties>({
    borderRadius: "12px",
    border: `2px solid ${theme.global.colors["light-1"]}`,
  });
  const hatStyle = React.useRef<React.CSSProperties>({
    zIndex: 100,
    position: "absolute",
    cursor: "move",
    willChange: "transform, left, top",
    transform: `translate(${fromPropsPosition.x}px, ${fromPropsPosition.y}px)`,
  });

  const hatRef = React.useRef<HTMLDivElement>();
  const borderRef = React.useRef<HTMLDivElement>();

  const nodeSize = node.size;
  const nodeId = node.id;
  const selected = props.selected;

  React.useEffect(() => {
    hatRef.current = document.getElementById(`${nodeId}-drag-hat`) as any;
    borderRef.current = document.getElementById(`${nodeId}-borders`) as any;
  }, [nodeId]);

  React.useEffect(() => {
    draggedPosition.current = fromPropsPosition;
  }, [fromPropsPosition]);

  React.useEffect(() => {
    const multidragMovingListener = (evt: IOnNodeDragEvent) => {
      if (evt.shouldSkip || nodeId === evt.id || !selected || !evt.multi) {
        return;
      }
      const { delta, canvasSize, multiSelectOffsets } = evt;
      const newPosition = getPositionWithParentBoundsSize(
        canvasSize,
        nodeSize || { h: 0, w: 0 },
        multiSelectOffsets[`${nodeId}-drag-hat`],
        draggedPosition.current.x + delta.x,
        draggedPosition.current.y + delta.y
      );
      draggedPosition.current = newPosition;
      updateVisuals(newPosition, true);
      bus.emit("evt-nodedrag", {
        shouldSkip: true,
        id: nodeId,
        position: newPosition,
        multi: true,
      });
    };
    const handler = bus.subscribe("evt-nodedrag", multidragMovingListener);
    return () => {
      bus.unSubscribe("evt-nodedrag", handler);
    };
  });

  const updateVisuals = (position: IPosition, dragging: boolean) => {
    if (!hatRef.current || !borderRef.current) {
      return;
    }
    hatRef.current.style.zIndex = dragging ? "110" : "100";
    hatRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
    borderRef.current.style.border = `2px solid ${
      theme.global.colors[dragging ? "accent-1" : "light-1"]
    }`;
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) {
      return;
    }

    let raFrameHandle = 0;
    const canvas: HTMLDivElement = document.getElementById(
      props.parentBoundId
    ) as any;

    const canvasRect = canvas.getBoundingClientRect();
    const nodeRect = hatRef.current?.getBoundingClientRect() as DOMRect;
    const scale: number = bus.getDiagramZoomScale().scale || 1;
    const canvasSize = {
      w: canvasRect.width / scale,
      h: canvasRect.height / scale,
    };
    const StartingDragPosition = draggedPosition.current;
    const nodeSize = { w: nodeRect.width / scale, h: nodeRect.height / scale };
    const multiSelectOffsets: any = getMultiselectionSquareRectOffsets(scale);

    // initial offset of pointer comapred to node position
    const mouseOffsetToNode = {
      x: e.clientX - nodeRect.x,
      y: e.clientY - nodeRect.y,
    };

    const scrollLeft = canvas.scrollLeft;
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
        (e.clientX + scrollLeft - rectLeft - mouseOffsetToNode.x) / scale;
      const y = (e.clientY + scrollTop - rectTop - mouseOffsetToNode.y) / scale;

      const finalPosition = getPositionWithParentBoundsSize(
        canvasSize,
        nodeSize,
        multiSelectOffsets[`${props.node.id}-drag-hat`] as any,
        x,
        y
      );

      const delta = {
        x: finalPosition.x - draggedPosition.current.x,
        y: finalPosition.y - draggedPosition.current.y,
      };

      draggedPosition.current = finalPosition;
      updateVisuals(finalPosition, true);
      bus.emit("evt-nodedrag", {
        id: props.node.id,
        position: finalPosition,
        canvasSize,
        multiSelectOffsets,
        delta,
        multi: selected,
      });
    };

    const throttledMove = (e: any) =>
      (raFrameHandle = requestAnimationFrame(() => mouseMoveHandler(e)));

    const mouseUpHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      cancelAnimationFrame(raFrameHandle);
      updateVisuals(draggedPosition.current, false);
      window.removeEventListener("pointerup", mouseUpHandler, false);
      window.removeEventListener("pointercancel", mouseUpHandler, false);
      window.removeEventListener("pointermove", throttledMove, true);
      const finalDelta = {
        x: draggedPosition.current.x - StartingDragPosition.x,
        y: draggedPosition.current.y - StartingDragPosition.y,
      };
      props.onDragEnd({
        node: props.node,
        position: draggedPosition.current,
        finalDelta,
        canvasSize,
        multiSelectOffsets,
        multi: !!selected,
      });
    };

    updateVisuals(draggedPosition.current, true);
    window.addEventListener("pointerup", mouseUpHandler, false);
    window.addEventListener("pointercancel", mouseUpHandler, false);
    window.addEventListener("pointermove", throttledMove, {
      capture: true,
      passive: true,
    });
  };

  const className = props.selected
    ? `flowDiagramNodeDraggerHat drag-hat-selected panzoom-exclude`
    : `flowDiagramNodeDraggerHat panzoom-exclude`;

  return (
    <div
      className={className}
      key={`${node.id}-drag-hat`}
      id={`${node.id}-drag-hat`}
      onPointerDown={onMouseDown}
      style={hatStyle.current}
    >
      <div
        id={`${node.id}-borders`}
        className="flowDiagramNodeDraggerHatBorders"
        style={bordersStyle.current}
      >
        {props.children}
      </div>
    </div>
  );
}
