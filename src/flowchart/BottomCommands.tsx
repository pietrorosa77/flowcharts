import React from "react";
import { ZoomIn, ZoomOut, View, Undo, Redo, Trash, Apps } from "grommet-icons";
import { debounce } from "lodash";
import DiagramContext from "./Context";
import { IChart } from "./definitions";
import { ActionButton } from "./ActionButton";
import { Box } from "grommet";

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
  toggleSidebar: () => void;
}

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
    toggleSidebar,
  } = props;

  const nodeSelected = Object.keys(chart.selected).filter(
    (k) => chart.selected[k]
  );
  const panZoomInfo = React.useContext(DiagramContext);
  const debounceUndo = React.useRef(debounce(onUndo, 80)).current;
  const debounceRedo = React.useRef(debounce(onRedo, 80)).current;

  const onDeleteNodes = () => {
    delNodes(nodeSelected);
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
      <ActionButton
        plain
        noOutline
        tip={`${sidebarOpened ? "Hide" : "Show"} sidebar`}
        icon={<Apps />}
        onClick={toggleSidebar}
        size="small"
        active={sidebarOpened}
        bgColor="transparent"
        style={{ alignSelf: "center", padding: "0px", margin: "4px" }}
      />
      <ActionButton
        plain
        noOutline
        tip={
          panZoomInfo.scale === 1 && panZoomInfo.x === 0 && panZoomInfo.y === 0
            ? undefined
            : "Restore view"
        }
        icon={<View />}
        onClick={onZoomReset}
        size="small"
        disabled={
          panZoomInfo.scale === 1 && panZoomInfo.x === 0 && panZoomInfo.y === 0
        }
        bgColor="transparent"
        style={{ alignSelf: "center", padding: "0px", margin: "4px" }}
      />
      <ActionButton
        plain
        noOutline
        tip={panZoomInfo.scale >= maxZoom ? undefined : "Zoom in"}
        icon={<ZoomIn />}
        onClick={onZoomIn}
        size="small"
        disabled={panZoomInfo.scale >= maxZoom}
        bgColor="transparent"
        style={{ alignSelf: "center", padding: "0px", margin: "4px" }}
      />
      <ActionButton
        plain
        noOutline
        tip={panZoomInfo.scale <= minZoom ? undefined : "Zoom out"}
        icon={<ZoomOut />}
        onClick={onZoomOut}
        size="small"
        disabled={panZoomInfo.scale <= minZoom}
        bgColor="transparent"
        style={{ alignSelf: "center", padding: "0px", margin: "4px" }}
      />
      <ActionButton
        plain
        noOutline
        tip={!canUndo ? undefined : "Undo"}
        icon={<Undo />}
        onClick={debounceUndo}
        size="small"
        disabled={!canUndo}
        bgColor="transparent"
        style={{ alignSelf: "center", padding: "0px", margin: "4px" }}
      />
      <ActionButton
        plain
        noOutline
        tip={!canRedo ? undefined : "Redo"}
        icon={<Redo />}
        onClick={debounceRedo}
        size="small"
        disabled={!canRedo}
        bgColor="transparent"
        style={{ alignSelf: "center", padding: "0px", margin: "4px" }}
      />
      <ActionButton
        plain
        noOutline
        tip={nodeSelected.length === 0 ? undefined : "Delete"}
        icon={<Trash />}
        onClick={onDeleteNodes}
        size="small"
        disabled={nodeSelected.length === 0}
        bgColor="transparent"
        style={{ alignSelf: "center", padding: "0px", margin: "4px" }}
      />
    </Box>
  );
};
