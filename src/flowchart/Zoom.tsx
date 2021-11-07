import * as React from "react";
import { throttle } from "lodash";

export interface IPanZoomLayerProps {
  height?: string;
  width?: string;
  zoom?: number;
  children?: any;
  x?: number;
  y?: number;
  onPan?: (x: number, y: number) => void;
}

export function ZoomLayer(props: IPanZoomLayerProps) {
  const [dragData, setDragData] = React.useState({
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    dragging: false,
  });
  const [matrix, setMatrix] = React.useState([
    props.zoom || 1,
    0,
    0,
    props.zoom || 1,
    props.x || 0,
    props.y || 0,
  ]);

  const [origin, setTransformOrigin] = React.useState<string | undefined>();

  const panX = matrix[4];
  const panY = matrix[5];
  const { dragging, dx, dy, x, y } = dragData;
  const container = React.useRef<HTMLDivElement>(null);
  const element = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    window.addEventListener("mouseup", onMouseUp, {
      capture: false,
      passive: true,
    });
    return () => {
      window.removeEventListener("mouseup", onMouseUp, false);
    };
    // eslint-disable-next-line
  }, [dragData, panX, panY, props.zoom]);

  React.useEffect(() => {
    window.addEventListener("mousemove", throttledMove, {
      capture: false,
      passive: true,
    });
    return () => {
      window.removeEventListener("mousemove", throttledMove, false);
    };
    // eslint-disable-next-line
  }, [dragging, dx, dy, x, y, props.zoom]);

  React.useEffect(() => {
    const scale = props.zoom || 1;
    const containerRect = container.current?.getBoundingClientRect();
    const x = (containerRect?.left || 0) / 2;
    const y = (containerRect?.top || 0) / 2;
    const newOriginX = x / scale;
    const newOriginY = y / scale;

    setTransformOrigin(`${newOriginX}px ${newOriginY}px`);
    setMatrix([props.zoom || 1, 0, 0, props.zoom || 1, matrix[4], matrix[5]]);
    // eslint-disable-next-line
  }, [props.zoom]);

  React.useEffect(() => {
    if (matrix[4] === props.x && matrix[5] === props.y) {
      return;
    }
    setMatrix([
      props.zoom || 1,
      0,
      0,
      props.zoom || 1,
      props.x || 0,
      props.y || 0,
    ]);
    // eslint-disable-next-line
  }, [props.x, props.y]);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.shiftKey) {
      return;
    }

    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    e.preventDefault();

    const newDragData = {
      dx: matrix[4],
      dy: matrix[5],
      x: e.pageX,
      y: e.pageY,
      cursor: "grabbing",
      dragging: true,
    };

    setDragData(() => newDragData);
  };

  const mouseMove = (e: any) => {
    if (!dragging) {
      return;
    }

    const deltaX = x - e.pageX;
    const deltaY = y - e.pageY;
    const newZoom = props.zoom || 1;
    const newMatrix = [newZoom, 0, 0, newZoom, dx - deltaX, dy - deltaY];

    setMatrix(() => newMatrix);
  };

  const throttledMove = throttle(mouseMove, 60, { trailing: true });

  const onMouseUp = () => {
    if (!dragData.dragging) {
      return;
    }

    setDragData((oldData) => ({
      ...oldData,
      dragging: false,
      cursor: "default",
    }));
    if (props.onPan) {
      props.onPan(matrix[4], matrix[5]);
    }
  };

  return (
    <div
      className={`pan-container ${dragging ? "grab-element" : ""}`}
      onMouseDown={onMouseDown}
      role="presentation"
      ref={container}
      style={{
        height: props.height,
        userSelect: "none",
        width: props.width,
      }}
    >
      <div
        ref={element}
        style={{
          transform: `matrix(${matrix.toString()})`,
          transformOrigin: origin,
        }}
      >
        {props.children}
      </div>
    </div>
  );
}
