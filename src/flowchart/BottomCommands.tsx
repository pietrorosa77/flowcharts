import React from "react";
import { View, Undo, Redo, Trash, Apps, Pan, Select } from "grommet-icons";
import { IChart, IToggleSidebarEvent } from "./definitions";
import { Box } from "grommet";
import { EventBusContext } from "./eventBus";

interface BottomCommandsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  chart: IChart;
  sidebarOpened?: boolean;
  onDeleteNodes: (nodeIds: Array<string>) => void;
}

const btnStyle: React.CSSProperties = {
  alignSelf: "center",
  padding: "0px",
  margin: "4px",
};
export const BottomCommands = (props: BottomCommandsProps) => {
  const {
    onDeleteNodes: delNodes,
    chart,
    canRedo,
    canUndo,
    sidebarOpened,
  } = props;

  const [opened, setOpened] = React.useState(sidebarOpened || false);
  const [panZoomEnabled, setPanZoomEnabled] = React.useState(true);
  const bus = React.useContext(EventBusContext);
  const nodeSelected = Object.keys(chart.selected).filter(
    (k) => chart.selected[k]
  );

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

  React.useEffect(() => {
    bus.emit("evt-togglepanzoom", panZoomEnabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panZoomEnabled]);

  const onDeleteNodes = () => {
    delNodes(nodeSelected);
  };

  const onToggleSidebar = () => {
    bus.emit("evt-toggleSidebar", { opened: !opened });
    setOpened(!opened);
  };

  const onZoomReset = () => {
    bus.emit("evt-resetpanzoom", undefined);
  };

  const onUndo = () => {
    if (props.canUndo) {
      props.onUndo();
    }
  };

  const onRedo = () => {
    if (props.canRedo) {
      props.onRedo();
    }
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
        style={btnStyle}
      />
      {/* <View
        role="button"
        onClick={onZoomResetInternal}
        className={`flowDiagramButtonBarAction ${
          panZoomInfo.scale === 1 && panZoomInfo.x === 0 && panZoomInfo.y === 0
            ? "inactive"
            : "active"
        }`}
        
        style={btnStyle}
      />
      <ZoomIn
        role="button"
        onClick={onZoomInInternal}
        className={`flowDiagramButtonBarAction ${
          panZoomInfo.scale >= maxZoom ? "inactive" : "active"
        }`}
        
        style={btnStyle}
      />

      <ZoomOut
        role="button"
        onClick={onZoomOutInternal}
        className={`flowDiagramButtonBarAction ${
          Math.round(panZoomInfo.scale * 100) / 100 <= minZoom
            ? "inactive"
            : "active"
        }`}
        
        style={btnStyle}
      /> */}

      <Pan
        role="button"
        onClick={() => setPanZoomEnabled(true)}
        className={`flowDiagramButtonBarAction ${
          !panZoomEnabled ? "off" : "on"
        }`}
        style={btnStyle}
      />

      <Select
        role="button"
        onClick={() => setPanZoomEnabled(false)}
        className={`flowDiagramButtonBarAction ${
          panZoomEnabled ? "off" : "on"
        }`}
        style={btnStyle}
      />

      <View
        role="button"
        onClick={onZoomReset}
        className={`flowDiagramButtonBarAction`}
        style={btnStyle}
      />

      <Undo
        role="button"
        onClick={onUndo}
        className={`flowDiagramButtonBarAction ${
          !canUndo ? "inactive" : "active"
        }`}
        style={btnStyle}
      />

      <Redo
        role="button"
        onClick={onRedo}
        className={`flowDiagramButtonBarAction ${
          !canRedo ? "inactive" : "active"
        }`}
        style={btnStyle}
      />

      <Trash
        role="button"
        onClick={nodeSelected.length === 0 ? onDeleteNodes : undefined}
        className={`flowDiagramButtonBarAction ${
          nodeSelected.length === 0 ? "inactive" : "active"
        }`}
        style={btnStyle}
      />
    </Box>
  );
};
