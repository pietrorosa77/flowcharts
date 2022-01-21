import * as React from "react";
import { IOnAreaSelectionChanged, INode, IPosition } from "./definitions";
import { ThemeContext } from "grommet";
import { EventBusContext } from "./eventBus";

interface IAreaSelectProps {
  onAreaSelectionChange: (evt: IOnAreaSelectionChanged) => void;
  children?: any;
  nodes: { [id: string]: INode };
}

export function AreaSelect(props: IAreaSelectProps) {
  const [coord, setCoord] = React.useState() as any;
  const bus = React.useContext(EventBusContext);
  const theme: any = React.useContext(ThemeContext);

  const onMouseDown = (startEvent: React.MouseEvent) => {
    if (!startEvent.shiftKey) {
      return;
    }

    const scale: number = bus.getDiagramZoomScale() || 1;

    const canvas: any = document.getElementById("dumbot-selectable-canvas");
    const canvasRect = canvas.getBoundingClientRect();

    startEvent.preventDefault();
    startEvent.stopPropagation();

    const from = {
      x: (startEvent.clientX - canvasRect.left) / scale,
      y: (startEvent.clientY - canvasRect.top) / scale,
    };

    let pointTo: IPosition;

    const mouseMoveHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      pointTo = {
        x: (e.clientX - canvasRect.left) / scale,
        y: (e.clientY - canvasRect.top) / scale,
      };

      setCoord({ from, to: pointTo });
    };

    const mouseUpHandler = () => {
      const selection = getSelectedNodes({ from, to: pointTo });
      props.onAreaSelectionChange(selection);
      window.removeEventListener("mouseup", mouseUpHandler, false);
      window.removeEventListener("mousemove", mouseMoveHandler, false);
      setCoord(undefined);
    };

    window.addEventListener("mouseup", mouseUpHandler, false);
    window.addEventListener("mousemove", mouseMoveHandler, false);
  };

  const getSelectionBox = (selArea: any) => {
    if (!selArea) {
      return null;
    }

    const rect = selectionBoxRect(selArea);

    const style: any = {
      position: "absolute",
      backgroundColor: theme.global.colors["accent-1"],
      border: "solid 1px rgba(123, 123, 123, 0.61)",
      zIndex: 200,
      opacity: 0.3,
      cursor: "crosshair",
      ...rect,
    };

    return <div style={style}></div>;
  };

  const selectionBoxRect = (selArea: any) => {
    const left = Math.min(selArea.from.x, selArea.to.x) - 1;
    const top = Math.min(selArea.from.y, selArea.to.y) - 1;
    const width = Math.abs(selArea.from.x - selArea.to.x) + 1;
    const height = Math.abs(selArea.from.y - selArea.to.y) + 1;
    return {
      top,
      left,
      width,
      height,
    };
  };

  const getSelectedNodes = (selectedArea: {
    from: IPosition;
    to: IPosition;
  }) => {
    const selectionRect = selectionBoxRect(selectedArea);
    const selection = Object.keys(props.nodes).reduce(
      (acc: any, key: string) => {
        const node = props.nodes[key];
        const nodeEl = document.getElementById(
          `node-${node.id}`
        ) as HTMLElement;
        const nodeBox = {
          top: node.position.y,
          left: node.position.x,
          width: nodeEl.clientWidth,
          height: nodeEl.clientHeight,
        };

        return {
          ...acc,
          [`${key}`]: boxIntersects(selectionRect, nodeBox),
        };
      },
      {}
    );
    return selection;
  };

  return (
    <div
      role="presentation"
      onMouseDown={onMouseDown}
      id="dumbot-selectable-canvas"
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      {getSelectionBox(coord)}
      {props.children}
    </div>
  );
}

/**
 * Calculate if two segments overlap in 1D
 * @param lineA [min, max]
 * @param lineB [min, max]
 */
const lineIntersects = (lineA: Array<number>, lineB: Array<number>): boolean =>
  lineA[1] >= lineB[0] && lineB[1] >= lineA[0];

/**
 * Detect 2D box intersection - the two boxes will intersect
 * if their projections to both axis overlap
 * @private
 */
const boxIntersects = (
  boxA: { left: number; top: number; width: number; height: number },
  boxB: { left: number; top: number; width: number; height: number }
): boolean => {
  // calculate coordinates of all points
  const boxAProjection = {
    x: [boxA.left, boxA.left + boxA.width],
    y: [boxA.top, boxA.top + boxA.height],
  };

  const boxBProjection = {
    x: [boxB.left, boxB.left + boxB.width],
    y: [boxB.top, boxB.top + boxB.height],
  };

  return (
    lineIntersects(boxAProjection.x, boxBProjection.x) &&
    lineIntersects(boxAProjection.y, boxBProjection.y)
  );
};
