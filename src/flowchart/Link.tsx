import * as React from "react";
import styled from "styled-components";
import { IPosition, INode } from "./definitions";
import { ThemeContext, Button } from "grommet";
import { isEqual } from "lodash";
import { Cycle, Unlink } from "grommet-icons";
import { ActionButton } from "./ActionButton";

const DelButton = styled(Button)<{ x: number; y: number }>`
  width: 50px;
  height: 50px;
  background-color: ${(props) => props.theme.global.colors["accent-1"]};
  cursor: pointer;
  border-radius: 100%;
  position: absolute;
  top: ${(props) => `${props.y - 25}px`};
  left: ${(props) => `${props.x - 25}px`};
  display: flex;
  align-items: center;
  outline: none;
  justify-content: center;
  z-index: 500;
  .del-link-icon {
    stroke: ${(props) => props.theme.global.colors.brand};
  }
  &:hover {
    .del-link-icon {
      stroke: #fff;
    }
  }
`;
//"translate3d(" + delPoint.x + "px," + delPoint.y + "px, 0)",
export interface ILinkProps {
  portFrom: string;
  nodeFrom: INode;
  nodeTo: INode;
  id: string;
  creating?: boolean;
  portHeight: number;
  onDeleteLink?: (id: string) => void;
}

export const Link = React.memo(
  function LinkInner(props: ILinkProps) {
    const lineEl = React.useRef<SVGPathElement>(null);
    const portIndex = props.nodeFrom.ports[props.portFrom].index;
    // center the line in the middle of the port so:
    // so subtract from port height hlf the line strokeWidth and  divide by 2 to get the middle
    const offsetY = (props.portHeight - 2) / 2;
    const startPos = {
      x:
        props.nodeFrom.position.x +
        (props.nodeFrom.size ? props.nodeFrom.size.w : 0),
      y:
        props.nodeFrom.position.y +
        (props.nodeFrom.size ? props.nodeFrom.size.h : 0) -
        (portIndex || 1) * props.portHeight +
        offsetY,
    };
    let endPos = props.nodeTo.position;
    const theme: any = React.useContext(ThemeContext);
    //const [delPoint, setDelPoint] = React.useState({ x: 0, y: 0 });
    const [isHovered, setIsHover] = React.useState(false);

    const getMidPoint = () => {
      if (!lineEl.current) {
        return null;
      }

      const pathLength = Math.floor(lineEl.current.getTotalLength());
      const pathMiddle = (50 * pathLength) / 100;
      const midPoint = lineEl.current.getPointAtLength(pathMiddle);
      return midPoint;
    };

    const midPoint = getMidPoint();

    const onHover = () => {
      setIsHover(true);
    };

    const onOut = () => {
      setIsHover(false);
    };

    const onDelete = () => {
      if (props.onDeleteLink) {
        props.onDeleteLink(props.id);
      }
    };

    if (!startPos || !endPos) return null;

    if (props.nodeTo.id === props.nodeFrom.id) {
      return (
        <ActionButton
          icon={<Cycle size="24" />}
          plain
          bgColor="#fff"
          fontColor="accent-1"
          tip="remove cycle link"
          style={{
            position: "absolute",
            top: startPos.y - 12,
            left: startPos.x - 12,
            padding: "2px",
            zIndex: 110,
          }}
          onClick={onDelete}
          size="small"
        />
      );
    }

    endPos = {
      x: endPos.x - 5,
      y: endPos.y + (props.creating ? 0 : 35),
    };

    // implement custom path functions here
    const points = defaultPath(startPos, endPos);
    return (
      <React.Fragment>
        <svg
          style={{
            overflow: "visible",
            position: "absolute",
            pointerEvents: "none",
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            width: "100%",
            height: "100%",
            zIndex: isHovered || props.creating ? 500 : 0,
          }}
        >
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
                fill={
                  isHovered
                    ? theme.global.colors["accent-1"]
                    : theme.global.colors.connection
                }
              />
            </marker>
          </defs>
          <path
            markerEnd={`url(#lmark-${props.id})`}
            ref={lineEl}
            d={points}
            style={{ pointerEvents: "all" }}
            stroke={
              isHovered
                ? theme.global.colors["accent-1"]
                : theme.global.colors.connection
            }
            strokeWidth="4"
            fill="none"
            onMouseEnter={onHover}
            onMouseLeave={onOut}
          />
        </svg>
        {!props.creating && midPoint && isHovered && (
          <DelButton
            x={midPoint.x}
            y={midPoint.y}
            icon={<Unlink className="del-link-icon" />}
            onMouseEnter={onHover}
            onMouseLeave={onOut}
            onClick={onDelete}
          ></DelButton>
        )}
      </React.Fragment>
    );
  },
  function arePropsEqual(prevProps: ILinkProps, nextProps: ILinkProps) {
    const equalFromPosition = isEqual(
      prevProps.nodeFrom.position,
      nextProps.nodeFrom.position
    );
    const equalFromSize = isEqual(
      prevProps.nodeFrom.size,
      nextProps.nodeFrom.size
    );

    const sameIndex =
      prevProps.nodeFrom.ports[prevProps.portFrom].index ===
      nextProps.nodeFrom.ports[nextProps.portFrom].index;

    const equalTo = isEqual(prevProps.nodeTo, nextProps.nodeTo);
    return equalFromSize && equalTo && equalFromPosition && sameIndex;
  }
);

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
