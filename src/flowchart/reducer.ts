import { nanoid } from "nanoid";
import { useRef, useState } from "react";
import {
  Actions,
  ChartDispatch,
  ChartMiddlewhare,
  ChartStore,
  IChart,
  IChartEventBus,
  IFlowchartState,
  ILink,
  INode,
  IOnAreaSelectionChanged,
  IOnDragNodeStopEvent,
  IOnEndConnection,
  IOnNodeSelectionChanged,
  IPosition,
  SimpleChartAction,
} from "./definitions";
import { composeMiddleware } from "./middlewares";
import { UndoRedoManager } from "./undo-redo";
import { getPositionWithParentBoundsSize } from "./utils";

let history: UndoRedoManager;

export function useChartReducer(
  reducer: (
    state: IFlowchartState,
    action: SimpleChartAction
  ) => IFlowchartState,
  initialState: IFlowchartState,
  middlewares: ChartMiddlewhare[] = [],
  eventBus: IChartEventBus
): [IFlowchartState, ChartDispatch] {
  const hook = useState(initialState);
  const state = hook[0];
  const setState = hook[1];
  const draftState = useRef(initialState);

  const dispatch = (action: SimpleChartAction) => {
    draftState.current = reducer(draftState.current, action);
    setState(draftState.current);
    return action;
  };
  const store: ChartStore = {
    getState: () => draftState.current,
    getEventBus: () => eventBus,
    dispatch: (...args: any[]) => (enhancedDispatch as any)(...args),
  };
  const chain = middlewares.map((middleware) => middleware(store));
  // eslint-disable-next-line
  const enhancedDispatch = composeMiddleware.apply(
    undefined,
    chain
  )(dispatch) as ChartDispatch;

  (window as any)._Dumbot = {
    enhancedDispatch,
  };

  return [state, enhancedDispatch];
}

export const createReducer = () => {
  return function chartReducer(
    state: IFlowchartState,
    action: SimpleChartAction
  ): IFlowchartState {
    let ret: IChart = state.chart;
    let name = state.name;
    const changeSummary = {
      totalActions: state.changeSummary.totalActions + 1,
      lastAction: action.type as Actions | undefined,
    };

    if (!history) {
      history = new UndoRedoManager(state.chart);
    }

    switch (action.type) {
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
        break;
      case "onDeleteLink":
        ret = onDeleteLink(state.chart, action.payload as string);
        break;
      case "onEndConnection":
        ret = onEndConnection(state.chart, action.payload as IOnEndConnection);
        break;
      case "onDragNodeStop":
        ret = onDragNodeStop(
          state.chart,
          action.payload as IOnDragNodeStopEvent
        );
        break;
      case "onUpdateNode":
        ret = onUpdateNode(state.chart, action.payload as INode);
        break;
      case "onNodeSizeChanged":
        ret = onNodeSizeChanged(
          state.chart,
          action.payload as ResizeObserverEntry[]
        );
        break;
      case "onUndo":
      case "onRedo":
        ret = action.type === "onUndo" ? history.undo() : history.redo();
        break;
      case "onNameChange":
        name = action.payload as string;
        break;

      default:
        ret = state.chart;
        break;
    }

    history.save(ret, action.type);

    return {
      name,
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      chart: ret,
      changeSummary,
    };
  };
};

export const getInitialState = (
  chart: IChart,
  name: string
): IFlowchartState => {
  return {
    name,
    canRedo: false,
    canUndo: false,
    chart,
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
  evt: ResizeObserverEntry[]
): IChart => {

  const nodes = evt.reduce((acc, c) => {
    const nodeId = c.target.getAttribute("data-node-id") as string;
    const node = chart.nodes[nodeId];
    const updtNode: INode = {
      ...node,
      size: {
        h: c.contentRect.height,
        w: c.contentRect.width,
      },
    };
    return {
      ...acc,
      [`${nodeId}`]: updtNode,
    };
  }, chart.nodes);

  return {
    ...chart,
    nodes,
  };
};

export const onDragNodeStop = (
  chart: IChart,
  evt: IOnDragNodeStopEvent
): IChart => {
  const { finalDelta, canvasSize, multiSelectOffsets, node: leadNode } = evt;
  const selectedIds = Object.keys(chart.selected).filter(
    (k) => k !== leadNode.id && chart.selected[k] === true
  );
  const alsoMoved = evt.multi
    ? selectedIds.reduce((acc, id) => {
        const nodePos = getPositionWithParentBoundsSize(
          canvasSize,
          chart.nodes[id].size || { h: 0, w: 0 },
          multiSelectOffsets[`${id}-drag-hat`],
          chart.nodes[id].position.x + finalDelta.x,
          chart.nodes[id].position.y + finalDelta.y
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
    nodes: {
      ...chart.nodes,
      ...alsoMoved,
      [`${leadNode.id}`]: {
        ...chart.nodes[evt.node.id],
        position: {
          x: evt.position.x,
          y: evt.position.y,
        },
      },
    },
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
    return { ...chart };
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
  };
};

export const onDeleteNodes = (chart: IChart, selectedNodes: Array<string>) => {
  const retChart = {
    ...chart,
    connecting: undefined,
  };

  const nodeIds = selectedNodes.filter(
    (k) => chart.nodes[k] && !chart.nodes[k].preventRemoval
  );

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
  };
};

export const onNodeAdded = (chart: IChart, node: INode): IChart => {
  return {
    ...chart,
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
  console.log("from node id", fromNodeId);
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
