import * as React from "react";
import DiagramContext from "./Context";
import { NodePort } from "./Port";
import {
  INode,
  ILink,
  IOnDragNodeEvent,
  IOnEndConnection,
  IOnStartConnection,
  IOnNodeSelectionChanged,
  IOnNodeSizeChanged,
  IPort,
} from "./definitions";
import { Box, Text, CheckBox, ThemeContext } from "grommet";
import { NodeDragger } from "./NodeDragger";
import { Configure, Trash } from "grommet-icons";
import { isEqual, isFunction } from "lodash";
import { blockEvent } from "./utils";
import useResizeObserver from "use-resize-observer";
import { ActionButton } from "./ActionButton";

export interface INodeProps {
  node: INode;
  links: Array<ILink>;
  onDragNode: (evt: IOnDragNodeEvent) => void;
  onDragNodeStop: (evt: IOnDragNodeEvent) => void;
  onStartConnection: (evt: IOnStartConnection) => void;
  onEndConnection: (evt: IOnEndConnection) => void;
  onNodeSelectionCanged: (evt: IOnNodeSelectionChanged) => void;
  onNodeSizeChanged: (evt: IOnNodeSizeChanged) => void;
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
    const context = React.useContext(DiagramContext);
    const theme: any = React.useContext(ThemeContext);
    const [checked, setChecked] = React.useState(props.selected);

    React.useEffect(() => {
      props.onNodeSelectionCanged({
        nodeId: node.id,
        selected: checked ? true : false,
      });
      // eslint-disable-next-line
    }, [checked]);

    React.useEffect(() => {
      setChecked(props.selected);
      // eslint-disable-next-line
    }, [props.selected]);

    const { ref } = useResizeObserver({
      onResize: ({ width, height }) => {
        props.onNodeSizeChanged({ id: node.id, width, height });
      },
    });

    const portKeys = Object.keys(node.ports || {}).sort(
      (p1, p2) => node.ports[p2].index - node.ports[p1].index
    );

    const onNodeSettings = () => {
      props.onNodeSettings(node);
    };

    const onNodeDelete = () => {
      props.onNodeDelete(node.id);
    };

    const nodeSize = `${props.maxNodeSize}px`;
    return (
      <NodeDragger
        scale={context.scale}
        node={props.node}
        selected={props.selected}
        parentBoundId={props.canvasId}
        onDragEnd={props.onDragNodeStop}
        onDrag={props.onDragNode}
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
          ref={ref as any}
        >
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
              style={{ alignItems: "center" }}
            >
              <Box onMouseDown={blockEvent}>
                <CheckBox
                  checked={checked ? true : false}
                  onChange={(event) => setChecked(event.target.checked)}
                />
              </Box>
              <Box style={{ flex: 1 }}>
                <Text>{node.title}</Text>
              </Box>
              <Box direction="row-reverse" gap="xsmall">
                <ActionButton
                  icon={<Configure size="20" />}
                  style={{ padding: "2px" }}
                  plain
                  onClick={onNodeSettings}
                  size="small"
                />
                <ActionButton
                  plain
                  style={{ padding: "2px" }}
                  icon={<Trash size="20" />}
                  onClick={onNodeDelete}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
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
                onStartConnection={props.onStartConnection}
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