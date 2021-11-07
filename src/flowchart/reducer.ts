import {
  IChart,
  IOnDragNodeEvent,
  IOnStartConnection,
  IOnNodeSelectionChanged,
  IOnAreaSelectionChanged,
  INode,
  IOnNodeSizeChanged,
  IOnEndConnection,
  IPosition,
  ILink,
  IFlowchartState,
  DiagramEventArgs,
  Actions,
  IOnUndoRedo,
} from "./definitions";
import { getPositionWithParentBoundsSize } from "./utils";

import { nanoid } from "nanoid";
import { cloneDeep } from "lodash";

export const reducer = (
  state: IFlowchartState,
  action: { type: Actions; payload: DiagramEventArgs }
) => {
  let ret: IChart = state.chart;
  let name = state.name;
  let retCxt = state.panZoomData;
  let uiState = state.uiState;
  const changeSummary = {
    totalActions: state.changeSummary.totalActions + 1,
    lastAction: action.type as Actions | undefined,
  };

  switch (action.type) {
    case "onStartAsyncOperation":
      uiState = {
        ...uiState,
        asyncOperation: action.payload as string,
      };
      break;
    case "onEndAsyncOperation":
      uiState = {
        ...uiState,
        asyncOperation: undefined,
      };
      break;
    case "onAreaSelectionChanged":
      ret = onAreaSelectionChanged(
        state.chart,
        action.payload as IOnAreaSelectionChanged
      );
      break;
    case "onNodeAdded":
      ret = onNodeAdded(state.chart, action.payload as INode);
      break;
    case "onNodeSelectionChanged":
      ret = onNodeSelectionChanged(
        state.chart,
        action.payload as IOnNodeSelectionChanged
      );
      break;
    case "onDeleteNodes":
      ret = onDeleteNodes(state.chart, action.payload as string[]);
      uiState = {
        ...uiState,
        propertyPane: (action.payload as string[]).includes(
          uiState.propertyPane?.id as string
        )
          ? undefined
          : uiState.propertyPane,
      };
      break;
    case "onDeleteLink":
      ret = onDeleteLink(state.chart, action.payload as string);
      break;
    case "onEndConnection":
      ret = onEndConnection(state.chart, action.payload as IOnEndConnection);
      break;
    case "onStartConnection":
      ret = onStartConnection(
        state.chart,
        action.payload as IOnStartConnection
      );
      break;
    case "onDragNodeStop":
      ret = onDragNodeStop(state.chart);
      break;
    case "onDragNode":
      ret = onDragNode(state.chart, action.payload as IOnDragNodeEvent);
      break;
    case "onUpdateNode":
      ret = onUpdateNode(state.chart, action.payload as INode);
      break;
    case "onNodeSizeChanged":
      ret = onNodeSizeChanged(
        state.chart,
        action.payload as IOnNodeSizeChanged
      );
      break;
    case "onUndo":
    case "onRedo":
      ret = (action.payload as IOnUndoRedo).chart;
      break;
    case "onPanChange":
      retCxt = {
        ...retCxt,
        x: (action.payload as { x: number }).x,
        y: (action.payload as { y: number }).y,
      };
      break;
    case "onZoomReset":
      retCxt = {
        ...retCxt,
        x: 0,
        y: 0,
        scale: 1,
      };
      break;
    case "onZoomIn":
      retCxt = {
        ...retCxt,
        scale: retCxt.scale + 0.2,
      };
      break;
    case "onZoomOut":
      retCxt = {
        ...retCxt,
        scale: retCxt.scale - 0.2,
      };
      break;

    case "toggleSidebar":
      uiState = {
        ...uiState,
        sidebarOpened: !uiState.sidebarOpened,
      };
      break;

    case "onNodeSettings":
      uiState = {
        ...uiState,
        propertyPane: action.payload
          ? cloneDeep(action.payload as INode)
          : undefined,
      };
      break;

    case "onNameChange":
      name = action.payload as string;
      break;

    default:
      ret = state.chart;
      uiState = state.uiState;
      retCxt = state.panZoomData;
      break;
  }

  return {
    name,
    chart: ret,
    panZoomData: retCxt,
    uiState,
    changeSummary,
  };
};

export const getInitialState = (
  chart: IChart,
  name: string
): IFlowchartState => {
  return {
    name,
    chart,
    panZoomData: {
      x: 0,
      y: 0,
      scale: 1,
      minZoom: 0.1,
      maxZoom: 2,
    },
    uiState: {
      sidebarOpened: true,
      propertyPane: undefined,
    },
    changeSummary: {
      totalActions: 0,
      lastAction: undefined,
    },
  };
};

export const onUpdateNode = (chart: IChart, updatedNode: INode): IChart => {
  const oldNode = chart.nodes[updatedNode.id];
  const newPorts = updatedNode.ports;

  const mergedNode: INode = {
    ...updatedNode,
    ports: newPorts,
    position: oldNode.position,
    size: oldNode.size,
  };

  const retChart = {
    ...chart,
    newLink: undefined,
    nodes: {
      ...chart.nodes,
      [`${mergedNode.id}`]: mergedNode,
    },
  };

  // delete links corresponding to removed ports
  const oldPortsKeys = Object.keys(oldNode.ports);
  const newPortKeys = Object.keys(newPorts);
  const removedPorts = oldPortsKeys.filter((k) => !newPortKeys.includes(k));
  const removedLinks = Object.keys(chart.links).filter((k) => {
    const l = chart.links[k];
    return removedPorts.includes(l.from.portId) && l.from.nodeId === oldNode.id;
  });
  removedLinks.forEach((id) => {
    delete retChart.links[id];
  });

  retChart.paths = getChartPaths(retChart.links);
  return retChart;
};

export const onNodeSizeChanged = (
  chart: IChart,
  evt: IOnNodeSizeChanged
): IChart => {
  const nodechart = chart.nodes[evt.id];
  const updtNode: INode = {
    ...nodechart,
    size: {
      h: evt.height as number,
      w: evt.width as number,
    },
  };

  return {
    ...chart,
    newLink: undefined,
    nodes: {
      ...chart.nodes,
      [`${evt.id}`]: updtNode,
    },
  };
};

export const onDragNode = (chart: IChart, evt: IOnDragNodeEvent): IChart => {
  const nodechart = chart.nodes[evt.node.id];
  if (nodechart) {
    const delta = {
      x: evt.position.x - nodechart.position.x,
      y: evt.position.y - nodechart.position.y,
    };

    const isNodeSelected = chart.selected[nodechart.id];

    // multidrag
    const selectedIds = Object.keys(chart.selected).filter(
      (k) => k !== nodechart.id && chart.selected[k] === true
    );

    // move other selected nodes only if current is selected
    const alsoMoved = isNodeSelected
      ? selectedIds.reduce((acc, id) => {
          const nodePos = getPositionWithParentBoundsSize(
            evt.canvasSize,
            chart.nodes[id].size || { h: 0, w: 0 },
            evt.multiSelectOffsets[`${id}-drag-hat`],
            chart.nodes[id].position.x + delta.x,
            chart.nodes[id].position.y + delta.y
          );

          return {
            ...acc,
            [`${id}`]: {
              ...chart.nodes[id],
              position: nodePos,
            },
          };
        }, {})
      : {};

    return {
      ...chart,
      newLink: undefined,
      nodes: {
        ...chart.nodes,
        ...alsoMoved,
        [`${evt.node.id}`]: {
          ...nodechart,
          position: {
            x: evt.position.x,
            y: evt.position.y,
          },
        },
      },
    };
  }
  return chart;
};

export const onDragNodeStop = (chart: IChart): IChart => ({
  ...chart,
  newLink: undefined,
});

export const onStartConnection = (
  chart: IChart,
  evt: IOnStartConnection
): IChart => {
  return {
    ...chart,
    newLink: evt.newLink,
  };
};

export const onEndConnection = (
  chart: IChart,
  evt: IOnEndConnection
): IChart => {
  const creatingLink = evt.link;

  const nodeTo = Object.keys(chart.nodes)
    .map((key) => chart.nodes[key])
    .find((n) => evt.link.posTo && pointInNode(n, evt.link.posTo));

  if (
    !nodeTo ||
    !isValidLink(nodeTo.id, evt.portLinks, creatingLink.from.nodeId)
  ) {
    return { ...chart, newLink: undefined };
  }

  const linkId = nanoid();

  const links = {
    ...chart.links,
    [`${linkId}`]: {
      ...creatingLink,
      to: nodeTo.id,
      id: linkId,
    },
  };
  const paths = getChartPaths(links);

  return {
    ...chart,
    links,
    paths,
    newLink: undefined,
  };
};

export const onDeleteLink = (chart: IChart, id: string): IChart => {
  const links = chart.links;
  delete links[id];
  const paths = getChartPaths(links);

  return {
    ...chart,
    links,
    paths,
    newLink: undefined,
  };
};

export const onDeleteNodes = (chart: IChart, selectedNodes: Array<string>) => {
  const retChart = {
    ...chart,
    connecting: undefined,
  };

  const nodeIds = selectedNodes.filter((k) => chart.nodes[k]);

  const links = Object.keys(chart.links).filter((k) => {
    const l = chart.links[k];
    return nodeIds.includes(l.to) || nodeIds.includes(l.from.nodeId);
  });

  nodeIds.forEach((id) => {
    delete retChart.nodes[id];
  });

  links.forEach((id) => {
    delete retChart.links[id];
  });

  retChart.selected = {};
  retChart.paths = getChartPaths(retChart.links);

  return retChart;
};

export const onNodeSelectionChanged = (
  chart: IChart,
  evt: IOnNodeSelectionChanged
): IChart => {
  const selected = {
    ...chart.selected,
    [`${evt.nodeId}`]: evt.selected,
  };

  return {
    ...chart,
    selected,
    newLink: undefined,
  };
};

export const onAreaSelectionChanged = (
  chart: IChart,
  evt: IOnAreaSelectionChanged
): IChart => {
  const selected = {
    ...evt,
  };

  return {
    ...chart,
    selected,
    newLink: undefined,
  };
};

export const onNodeAdded = (chart: IChart, node: INode): IChart => {
  return {
    ...chart,
    newLink: undefined,
    nodes: {
      ...chart.nodes,
      [`${node.id}`]: node,
    },
  };
};

export const pointInNode = (node: INode, point: IPosition) => {
  const nodeSize = node.size || {
    h: 0,
    w: 0,
  };
  const x1 = node.position.x;
  const y1 = node.position.y;
  const x2 = node.position.x + nodeSize.w;
  const y2 = node.position.y + nodeSize.h;

  return point.x > x1 && point.x < x2 && point.y > y1 && point.y < y2;
};

export const isValidLink = (
  nodeToId: string,
  links: ILink[],
  fromNodeId: string
) => {
  console.log("from node", fromNodeId);
  return (
    //nodeToId !== fromNodeId &&
    links.filter((l) => l.to === nodeToId).length === 0
  );
};

export const getChartPaths = (links: { [id: string]: ILink }) =>
  Object.values(links).reduce((acc, current) => {
    const linksMapKey = `${current.from.nodeId}-${current.from.portId}`;
    return {
      ...acc,
      [`${linksMapKey}`]: current.to,
    };
  }, {} as { [id: string]: string });
