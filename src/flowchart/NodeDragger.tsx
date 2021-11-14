import * as React from "react";
import {
  getMultiselectionSquareRectOffsets,
  getPositionWithParentBoundsSize,
} from "./utils";
import { INode, IOnDragNodeEvent } from "./definitions";
import { ThemeContext } from "grommet";

export interface INodeDraggerProps {
  children: any;
  node: INode;
  scale: number;
  parentBoundId: string;
  cursor?: string;
  selected?: boolean;
  onDragEnd: (evt: IOnDragNodeEvent) => void;
}

export function NodeDragger(props: INodeDraggerProps) {
  const fromPropsPosition = props.node.position;
  const [position, setPosition] = React.useState(fromPropsPosition);
  const draggedPosition = React.useRef(position);
  const selected = props.selected;
  const node = props.node;
  const nodeSize = node.size;
  const nodeId = node.id;
  const [dragging, setDragging] = React.useState(false);
  const theme: any = React.useContext(ThemeContext);

  React.useEffect(() => {
    draggedPosition.current = fromPropsPosition;
    setPosition(fromPropsPosition);
  }, [fromPropsPosition]);

  React.useEffect(() => {
    const multidragMovingListener = (evt: any) => {
      if (evt.detail.shouldSkip || nodeId === evt.detail.id || !selected) {
        return;
      }
      const { delta, canvasSize, multiSelectOffsets } = evt.detail;
      const newPosition = getPositionWithParentBoundsSize(
        canvasSize,
        nodeSize || { h: 0, w: 0 },
        multiSelectOffsets[`${nodeId}-drag-hat`],
        draggedPosition.current.x + delta.x,
        draggedPosition.current.y + delta.y
      );
      draggedPosition.current = newPosition;
      document.dispatchEvent(
        new CustomEvent("nodePositionChanged", {
          detail: {
            shouldSkip: true,
            id: nodeId,
            position: newPosition,
          },
        })
      );
      setPosition(newPosition);
    };
    document.addEventListener("nodePositionChanged", multidragMovingListener);
    return () => {
      document.removeEventListener(
        "nodePositionChanged",
        multidragMovingListener
      );
    };
  }, [nodeId, selected, nodeSize]);

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

      requestAnimationFrame(() => {
        document.dispatchEvent(
          new CustomEvent("nodePositionChanged", {
            detail: {
              id: props.node.id,
              position: finalPosition,
              canvasSize,
              multiSelectOffsets,
              delta,
            },
          })
        );
        setPosition(finalPosition);
      });
    };

    const throttledMove = (e: any) =>
      requestAnimationFrame(() => mouseMoveHandler(e));

    const mouseUpHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      window.removeEventListener("mouseup", mouseUpHandler, false);
      window.removeEventListener("mousemove", throttledMove, true);
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
      });
    };

    setDragging(true);
    window.addEventListener("mouseup", mouseUpHandler, false);
    window.addEventListener("mousemove", throttledMove, {
      capture: true,
      passive: true,
    });
  };

  const className = props.selected
    ? `flowDiagramNodeDraggerHat drag-hat-selected`
    : `flowDiagramNodeDraggerHat`;

  return (
    <div
      className={className}
      key={`${node.id}-drag-hat`}
      id={`${node.id}-drag-hat`}
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: "move",
        zIndex: dragging ? 110 : 100,
      }}
    >
      <div
        style={{
          borderRadius: "12px",
          border: `2px solid ${
            theme.global.colors[dragging ? "accent-1" : "light-1"]
          }`,
        }}
      >
        {props.children}
      </div>
    </div>
  );
}
