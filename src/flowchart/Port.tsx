import * as React from "react";
import styled from "styled-components";
import { IPort, ILink, INode, IOnEndConnection } from "./definitions";
import { isEqual, throttle } from "lodash";
import { Box, Text } from "grommet";
import { EventBusContext } from "./eventBus";

const PORT_HEIGHT = 30;
export const PORT_OFFSET_Y = 35;

export const OutputPort = styled.div<any>`
  position: absolute;
  display: flex;
  justify-content: center;
  height: 100%;
  top: 0;
  right: -15px;
  flex-direction: column;
`;

const PortOuter = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    transform: scale(1.2);
    transition: 0.2s ease-out;
  }
  &:hover > div {
    transform: scale(1.2);
    transition: 0.2s ease-out;
    background: ${(props) => props.theme.global.colors.connection};
  }
`;

const PortInner = styled.div<any>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) =>
    props.active
      ? props.theme.global.colors["connection"]
      : props.connected
      ? props.theme.global.colors["accent-1"]
      : props.theme.global.colors["status-disabled"]};
  cursor: pointer;
`;

const OutContainer = styled.div`
  position: relative;
  height: ${PORT_HEIGHT}px;
  width: 100%;
  display: flex;
`;

const ComponentContainer = styled.div`
  width: 100%;
  display: flex;
`;

const PortContentBox = styled(Box)`
  width: 100%;
  position: relative;
  justify-content: center;
  align-items: center;
`;

interface IPortContentProps {
  port: IPort;
  renderPort?: (port: IPort) => JSX.Element;
}

function PortContent(props: IPortContentProps) {
  const port = props.port;

  const portContent = (
    <PortContentBox responsive={false} round="4px" background={port.bgColor}>
      {props.renderPort ? (
        props.renderPort(port)
      ) : (
        <Box direction="row" gap="small" align="center">
          <Text>{port.text}</Text>
        </Box>
      )}
    </PortContentBox>
  );

  return portContent;
}

export interface INodePortProps {
  port: IPort;
  links: Array<ILink>;
  node: INode;
  canvasId: string;
  allowMultiple: boolean;
  onEndConnection: (evt: IOnEndConnection) => void;
  renderPort?: (port: IPort) => JSX.Element;
  hidePort?: boolean;
}

export const PortContainer = (props: IPortContentProps & { children: any }) => {
  const port = props.port;
  return (
    <Box height={`${PORT_OFFSET_Y}px`} width="100%">
      <OutContainer>
        <ComponentContainer>
          <PortContent port={port} renderPort={props.renderPort}></PortContent>
        </ComponentContainer>
        {props.children}
      </OutContainer>
    </Box>
  );
};

export const NodePort = React.memo(
  function NodePortInternal(props: INodePortProps) {
    const bus = React.useContext(EventBusContext);
    const port = props.port;
    const node = props.node;

    const handleMouseDown = (startEvent: React.MouseEvent) => {
      startEvent.preventDefault();
      startEvent.stopPropagation();

      if (!props.allowMultiple && props.links && props.links.length > 0) {
        return;
      }

      const canvas: any = document.getElementById(props.canvasId);
      const canvasRect = canvas.getBoundingClientRect();
      const scale: number = bus.getDiagramZoomScale().scale || 1;

      const _mouseMoveHandler = (e: MouseEvent) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.cancelBubble = true;

        const to = {
          x: (e.clientX - canvasRect.left) / scale,
          y: (e.clientY - canvasRect.top) / scale,
        };

        requestAnimationFrame(() =>
          bus.emit("evt-connection", {
            nodeFromId: node.id,
            positionTo: to,
            portFromId: port.id,
          })
        );
      };

      const mouseUpHandler = (e: MouseEvent) => {
        window.removeEventListener("pointermove", throttledMove, {
          capture: false,
        });
        window.removeEventListener("pointerup", mouseUpHandler, false);
        const link = {
          from: {
            nodeId: node.id,
            portId: port.id,
          },
          id: "newLink",
          to: "",
          posTo: {
            x: (e.clientX - canvasRect.left) / scale,
            y: (e.clientY - canvasRect.top) / scale,
          },
        };

        // ensure mouse up comes last and no other mousedown will be queued after it
        // causing a double line
        const upTimeout = setTimeout(() => {
          bus.emit("evt-connection", undefined);
          props.onEndConnection({ link, portLinks: props.links });
          clearTimeout(upTimeout);
        }, 100);
      };

      const throttledMove = throttle(_mouseMoveHandler, 30);
      window.addEventListener("pointerup", mouseUpHandler, false);
      window.addEventListener("pointermove", throttledMove, {
        capture: false,
        passive: true,
      });
    };

    const highlightLink = () => {
      bus.emit("evt-highlightLink", {
        highlight: true,
        key: `${props.node.id}-${props.port.id}`,
      });
    };

    const turnOffLink = () => {
      bus.emit("evt-highlightLink", {
        highlight: false,
        key: `${props.node.id}-${props.port.id}`,
      });
    };

    return (
      <PortContainer port={props.port} renderPort={props.renderPort}>
        {!props.hidePort && (
          <OutputPort
            onPointerDown={handleMouseDown}
            onMouseEnter={highlightLink}
            onMouseLeave={turnOffLink}
          >
            <PortOuter className="outer-port">
              <PortInner
                id={`${node.id}-${port.id}`}
                connected={props.links && props.links.length}
              ></PortInner>
            </PortOuter>
          </OutputPort>
        )}
      </PortContainer>
    );
  },
  function arePropsEqual(prevProps: INodePortProps, nextProps: INodePortProps) {
    return (
      isEqual(prevProps.port, nextProps.port) &&
      isEqual(prevProps.links, nextProps.links)
    );
  }
);
