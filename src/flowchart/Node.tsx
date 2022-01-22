import * as React from "react";
import { NodePort } from "./Port";
import {
  INode,
  ILink,
  IOnDragNodeStopEvent,
  IOnEndConnection,
  IOnNodeSelectionChanged,
  IPort,
  ExtendedNode,
} from "./definitions";
import { Box, Text, CheckBox, ThemeContext } from "grommet";
import { NodeDragger } from "./NodeDragger";
import { Configure, Trash } from "grommet-icons";
import { isEqual, isFunction } from "lodash";
import { blockEvent } from "./utils";
import { EventBusContext } from "./eventBus";

export interface INodeProps {
  node: ExtendedNode;
  links: Array<ILink>;
  onEndConnection: (evt: IOnEndConnection) => void;
  onDragNodeStop: (evt: IOnDragNodeStopEvent) => void;
  onNodeSelectionChanged: (evt: IOnNodeSelectionChanged) => void;
  onNodeSettings: (node: INode) => void;
  onNodeDelete: (id: string) => void;
  canvasId: string;
  selected?: boolean;
  highlighted?: boolean;
  renderPort?: (port: IPort) => JSX.Element;
  children: any;
  maxNodeSize: number;
}

export const Node = React.memo(
  function NodeInner(props: INodeProps) {
    const node = props.node;
    const nodeRef = React.useRef<HTMLDivElement>();
    const theme: any = React.useContext(ThemeContext);
    const bus = React.useContext(EventBusContext);
    const [checked, setChecked] = React.useState(props.selected);

    React.useEffect(() => {
      if (checked === undefined) {
        return;
      }
      props.onNodeSelectionChanged({
        nodeId: node.id,
        selected: checked ? true : false,
      });
      // eslint-disable-next-line
    }, [checked]);

    React.useEffect(() => {
      setChecked(props.selected);
      // eslint-disable-next-line
    }, [props.selected]);

    React.useLayoutEffect(() => {
      const node = nodeRef.current;
      bus.observeElementSize(node as HTMLDivElement);
      return () => {
        bus.unobserveElementSize(node as HTMLDivElement);
      };
      // eslint-disable-next-line
    }, []);

    const onNodeSettings = () => {
      props.onNodeSettings(node);
    };

    const onNodeDelete = () => {
      props.onNodeDelete(node.id);
    };

    const portKeys = Object.keys(node.ports || {}).sort(
      (p1, p2) => node.ports[p2].index - node.ports[p1].index
    );

    const setCheckedCB = (event: any) => {
      setChecked(event.target.checked);
    };

    const nodeSize = `${props.maxNodeSize}px`;

    return (
      <NodeDragger
        node={props.node}
        selected={props.selected}
        parentBoundId={props.canvasId}
        onDragEnd={props.onDragNodeStop}
      >
        <Box
          className="flowDiagramNodeContainer"
          responsive={false}
          width={{ max: nodeSize, min: nodeSize }}
          align="center"
          round="small"
          justify="center"
          style={{
            WebkitUserSelect: "none",
            userSelect: "none",
            boxShadow: props.selected
              ? `0 0 20px 5px ${theme.global.colors["accent-1"]}`
              : props.highlighted
              ? `0 0 20px 5px ${theme.global.colors["nodehighlight"]}`
              : "none",
          }}
          id={`node-${node.id}`}
          data-node-id={node.id}
          ref={nodeRef as any}
        >
          <NodeHeader
            title={node.title}
            checked={checked}
            preventRemoval={node.preventRemoval}
            onDelete={onNodeDelete}
            onSettings={onNodeSettings}
            onCheckedChange={setCheckedCB}
          />
          <Box
            responsive={false}
            width="100%"
            pad="none"
            background={{ color: "dark-1", opacity: 0.8 }}
          >
            <NodeContentView node={node}>{props.children}</NodeContentView>
          </Box>
          <Box
            responsive={false}
            width="100%"
            round={{ corner: "bottom", size: "small" }}
            pad={{ horizontal: "3px" }}
            background={{ color: "dark-1", opacity: 0.8 }}
          >
            {portKeys.map((key) => (
              <NodePort
                key={key}
                node={node}
                canvasId={props.canvasId}
                links={props.links.filter((p) => p.from.portId === key)}
                port={node.ports[key]}
                allowMultiple={false}
                renderPort={props.renderPort}
                onEndConnection={props.onEndConnection}
              ></NodePort>
            ))}
          </Box>
        </Box>
      </NodeDragger>
    );
  },
  function arePropsEqual(prevProps: INodeProps, nextProps: INodeProps) {
    const equalNode = isEqual(prevProps.node, nextProps.node);
    const equalLinks = isEqual(prevProps.links, nextProps.links);
    const equalSelection = isEqual(prevProps.selected, nextProps.selected);
    const equalHighlight = isEqual(
      prevProps.highlighted,
      nextProps.highlighted
    );
    return equalNode && equalLinks && equalSelection && equalHighlight;
  }
);

export const NodeContentView = React.memo(
  function NodeContentViewInner(props: { node: INode; children: any }) {
    const children = isFunction(props.children)
      ? props.children(props.node)
      : props.children;

    return (
      <Box flex pad="xsmall" width="100%" className="flowDiagramNodeContent">
        {children}
      </Box>
    );
  },
  function arePropsEqual(
    prevProps: { node: INode },
    nextProps: { node: INode }
  ) {
    return (
      prevProps.node.id === nextProps.node.id &&
      prevProps.node.content === nextProps.node.content
    );
  }
);

interface INodeHeaderProps {
  checked?: boolean;
  onCheckedChange: (event: any) => void;
  title: string;
  onDelete: () => void;
  onSettings: () => void;
  preventRemoval?: boolean;
}

const txtStyle: React.CSSProperties = {
  textOverflow: "ellipsis",
  display: "inline-block",
  maxWidth: "145px",
  overflow: "hidden",
  whiteSpace: "nowrap",
};

const boxAlignStyle: React.CSSProperties = { alignItems: "center" };
const boxFlexStyle: React.CSSProperties = { flex: 1 };

export const NodeHeader = (props: INodeHeaderProps) => {
  const {
    checked,
    onCheckedChange,
    title,
    onDelete,
    onSettings,
    preventRemoval,
  } = props;
  return (
    <Box
      round={{ corner: "top", size: "small" }}
      pad="5px"
      responsive={false}
      width="100%"
      justify="center"
      background={{ color: "brand", opacity: 0.8 }}
      overflow="hidden"
    >
      <Box
        direction="row"
        responsive={false}
        gap="xsmall"
        data-stopdrag={true}
        style={boxAlignStyle}
      >
        <Box onMouseDown={blockEvent}>
          <CheckBox
            checked={checked ? true : false}
            onChange={onCheckedChange}
          />
        </Box>
        <Box style={boxFlexStyle}>
          <Text style={txtStyle}>{title}</Text>
        </Box>
        <Box direction="row-reverse" gap="xsmall">
          <Configure
            size="20"
            onClick={onSettings}
            cursor="pointer"
            className="flowDiagramNodeActionIcon"
          />
          {!preventRemoval && (
            <Trash
              size="20"
              onClick={onDelete}
              cursor="pointer"
              className="flowDiagramNodeActionIcon"
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
