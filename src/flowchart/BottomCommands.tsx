import React from "react";
import { ZoomIn, ZoomOut, View, Undo, Redo, Trash, Apps } from "grommet-icons";
import { debounce } from "lodash";
import DiagramContext from "./Context";
import { IChart, IToggleSidebarEvent } from "./definitions";
import { Box } from "grommet";
import { DispatcherContext } from "./reducer";

interface BottomCommandsProps {
  canUndo: boolean;
  canRedo: boolean;
  maxZoom: number;
  minZoom: number;
  chart: IChart;
  sidebarOpened?: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDeleteNodes: (nodeIds: Array<string>) => void;
}

const btnStyle: React.CSSProperties = {
  alignSelf: "center",
  padding: "0px",
  margin: "4px",
};
export const BottomCommands = (props: BottomCommandsProps) => {
  const {
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onUndo,
    onRedo,
    onDeleteNodes: delNodes,
    chart,
    minZoom,
    maxZoom,
    canRedo,
    canUndo,
    sidebarOpened,
  } = props;

  const [opened, setOpened] = React.useState(sidebarOpened || false);
  const { dispatcher: dispatch, bus } = React.useContext(DispatcherContext);
  const nodeSelected = Object.keys(chart.selected).filter(
    (k) => chart.selected[k]
  );
  const panZoomInfo = React.useContext(DiagramContext);
  const debounceUndo = React.useRef(debounce(onUndo, 80)).current;
  const debounceRedo = React.useRef(debounce(onRedo, 80)).current;

  React.useEffect(() => {
    const handler = bus.subscribe(
      "evt-toggleSidebar",
      (evt: IToggleSidebarEvent) => {
        setOpened(evt.opened);
      }
    );
    return () => bus.unSubscribe("evt-toggleSidebar", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDeleteNodes = () => {
    delNodes(nodeSelected);
  };

  const onToggleSidebar = () => {
    dispatch({ type: "evt-toggleSidebar", payload: { opened: !opened } });
    setOpened(!opened);
  };

  return (
    <Box
      background="bars"
      direction="row"
      round={{ corner: "top-left", size: "small" }}
      pad="xsmall"
      style={{
        position: "absolute",
        opacity: 0.8,
        right: 0,

        bottom: 0,
      }}
    >
      <Apps
        onClick={onToggleSidebar}
        className={`flowDiagramButtonBarAction${opened ? " on" : ""}`}
        role="button"
        cursor="pointer"
        style={btnStyle}
      />
      <View
        role="button"
        onClick={onZoomReset}
        className={`flowDiagramButtonBarAction ${
          panZoomInfo.scale === 1 && panZoomInfo.x === 0 && panZoomInfo.y === 0
            ? "inactive"
            : "active"
        }`}
        cursor="pointer"
        style={btnStyle}
      />
      <ZoomIn
        role="button"
        onClick={onZoomIn}
        className={`flowDiagramButtonBarAction ${
          panZoomInfo.scale >= maxZoom ? "inactive" : "active"
        }`}
        cursor="pointer"
        style={btnStyle}
      />

      <ZoomOut
        role="button"
        onClick={onZoomOut}
        className={`flowDiagramButtonBarAction ${
          Math.round(panZoomInfo.scale * 100) / 100 <= minZoom
            ? "inactive"
            : "active"
        }`}
        cursor="pointer"
        style={btnStyle}
      />

      <Undo
        role="button"
        onClick={debounceUndo}
        className={`flowDiagramButtonBarAction ${
          !canUndo ? "inactive" : "active"
        }`}
        cursor="pointer"
        style={btnStyle}
      />

      <Redo
        role="button"
        onClick={debounceRedo}
        className={`flowDiagramButtonBarAction ${
          !canRedo ? "inactive" : "active"
        }`}
        cursor="pointer"
        style={btnStyle}
      />

      <Trash
        role="button"
        onClick={onDeleteNodes}
        className={`flowDiagramButtonBarAction ${
          nodeSelected.length === 0 ? "inactive" : "active"
        }`}
        cursor="pointer"
        style={btnStyle}
      />
    </Box>
  );
};
