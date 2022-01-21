import * as React from "react";
import {
  IPosition,
  INode,
  IOnConnection,
  IChart,
  IOnHighlightLinkEvent,
} from "./definitions";
import { ThemeContext } from "grommet";
import { DispatcherContext } from "./reducer";

export interface ILinkProps {
  portFrom: string;
  nodeFrom: INode;
  nodeTo: INode;
  id: string;
  portHeight: number;
  onDeleteLink?: (id: string) => void;
}

const svgStyle: React.CSSProperties = {
  overflow: "visible",
  position: "absolute",
  pointerEvents: "none",
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
  width: "100%",
  height: "100%",
  zIndex: 0,
};

const svgStyleNew: React.CSSProperties = {
  ...svgStyle,
  zIndex: 500,
};

export const NewLink = (props: { portHeight: number; chart: IChart }) => {
  const theme: any = React.useContext(ThemeContext);
  const [connection, setConnection] = React.useState<IOnConnection>();
  const { bus } = React.useContext(DispatcherContext);

  React.useEffect(() => {
    const handler = bus.subscribe("evt-connection", (evt: IOnConnection) => {
      setConnection(evt);
    });
    return () => {
      bus.unSubscribe("evt-connection", handler);
    };
    // eslint-disable-next-line
  }, []);

  if (!connection) {
    return null;
  }

  const nodeFrom = props.chart.nodes[connection.nodeFromId];
  const portIndex = nodeFrom.ports[connection.portFromId].index;
  const { startPos, endPos } = calculatePosition(
    nodeFrom,
    props.portHeight,
    nodeFrom.position,
    connection.positionTo,
    portIndex,
    true
  );
  const points = defaultPath(startPos, endPos);

  return (
    <React.Fragment>
      <svg style={svgStyleNew}>
        <defs>
          <marker
            id={`lmark-newConnection`}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 z"
              fill={theme.global.colors["accent-1"]}
            />
          </marker>
        </defs>
        <path
          markerEnd={`url(#lmark-newConnection`}
          d={points}
          stroke={theme.global.colors["accent-1"]}
          strokeWidth="4"
          fill="none"
        />
      </svg>
    </React.Fragment>
  );
};

export const Link = (props: ILinkProps) => {
  const theme: any = React.useContext(ThemeContext);
  const { bus } = React.useContext(DispatcherContext);
  const fromId = props.nodeFrom.id;
  const toId = props.nodeTo.id;
  const fromFromProps = props.nodeFrom.position;
  const toFromProps = props.nodeTo.position;
  const fromRef = React.useRef(fromFromProps);
  const toRef = React.useRef(toFromProps);
  const svgEl = React.useRef<SVGSVGElement>(null);
  const lineEl = React.useRef<SVGPathElement>(null);
  const markerEl = React.useRef<SVGPathElement>(null);
  const portIndex = props.nodeFrom.ports[props.portFrom].index;

  React.useEffect(() => {
    const nodeMovingListener = (evt: any) => {
      const { id, position } = evt;

      if (id !== fromId && id !== toId) {
        return;
      }

      if (id === fromId && id === toId) {
        fromRef.current = position;
        toRef.current = position;
      } else if (id === fromId) {
        fromRef.current = position;
      } else {
        toRef.current = position;
      }

      const { startPos, endPos } = calculatePosition(
        props.nodeFrom,
        props.portHeight,
        fromRef.current,
        toRef.current,
        portIndex
      );
      const points = defaultPath(startPos, endPos);
      lineEl.current?.setAttribute("d", points);
    };

    const mHandler = bus.subscribe("evt-nodedrag", nodeMovingListener);
    return () => {
      bus.unSubscribe("evt-nodedrag", mHandler);
    };
  });

  React.useEffect(() => {
    fromRef.current = fromFromProps;
  }, [fromFromProps]);

  React.useEffect(() => {
    toRef.current = toFromProps;
  }, [toFromProps]);

  React.useEffect(() => {
    const handler = bus.subscribe(
      "evt-highlightLink",
      (evt: IOnHighlightLinkEvent) => {
        if (evt.key === `${props.nodeFrom.id}-${props.portFrom}`) {
          (svgEl.current as any).style.zIndex = evt.highlight ? "500" : "0";
          (markerEl.current as any).style.fill =
            theme.global.colors[evt.highlight ? "accent-1" : "connection"];
          (lineEl.current as any).style.stroke =
            theme.global.colors[evt.highlight ? "accent-1" : "connection"];
        }
      }
    );
    return () => {
      bus.unSubscribe("evt-highlightLink", handler);
    };
    // eslint-disable-next-line
  }, []);

  const { startPos, endPos } = calculatePosition(
    props.nodeFrom,
    props.portHeight,
    fromRef.current,
    toRef.current,
    portIndex
  );

  if (!startPos || !endPos) return null;

  // implement custom path functions here
  const points = defaultPath(startPos, endPos);
  return (
    <React.Fragment>
      <svg ref={svgEl} style={svgStyle}>
        <defs>
          <marker
            id={`lmark-${props.id}`}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 z"
              ref={markerEl}
              fill={theme.global.colors.connection}
            />
          </marker>
        </defs>
        <path
          markerEnd={`url(#lmark-${props.id})`}
          ref={lineEl}
          d={points}
          stroke={theme.global.colors.connection}
          strokeWidth="4"
          fill="none"
        />
      </svg>
    </React.Fragment>
  );
};

export function calculatePosition(
  nodeFrom: INode,
  portHeight: number,
  from: IPosition,
  to: IPosition,
  portIndex: number,
  creating?: boolean
) {
  const offsetY = (portHeight - 2) / 2;
  const startPos = {
    x: from.x + (nodeFrom.size ? nodeFrom.size.w : 0),
    y:
      from.y +
      (nodeFrom.size ? nodeFrom.size.h : 0) -
      (portIndex || 1) * portHeight +
      offsetY,
  };
  const endPos = {
    x: to.x - 5,
    y: to.y + (creating ? 0 : 35),
  };

  return {
    startPos,
    endPos,
  };
}

export function defaultPath(startPos: IPosition, endPos: IPosition) {
  const bezierWeight = 0.675;
  const x1 = startPos.x;
  const x2 = endPos.x;
  const y1 = startPos.y;
  const y2 = endPos.y;
  const hx1 = x1 + Math.abs(x2 - x1) * bezierWeight;
  const hx2 = x2 - Math.abs(x2 - x1) * bezierWeight;

  return `M ${x1} ${y1} C ${hx1} ${y1} ${hx2} ${y2} ${x2} ${y2}`;
}

export function straightPath(startPos: IPosition, endPos: IPosition) {
  const x1 = startPos.x;
  const x2 = endPos.x;
  const y1 = startPos.y;
  const y2 = endPos.y;
  return `M ${x1} ${y1} ${x2} ${y2}`;
}
