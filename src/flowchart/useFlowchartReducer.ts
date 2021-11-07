import React from "react";
import {
  Actions,
  DiagramEventArgs,
  IChart,
  IFlowchartState,
} from "./definitions";
import { UndoRedoManager } from "./undo-redo";

export const useFlowchartReducer = (
  reducer: (
    state: IFlowchartState,
    action: {
      type: Actions;
      payload: DiagramEventArgs;
    }
  ) => IFlowchartState,
  initialState: IFlowchartState,
  onStateChanging: (
    state: IFlowchartState,
    type: Actions,
    payload: DiagramEventArgs
  ) => void,
  onStateChanged: (state: IFlowchartState, type: Actions) => void,
  maxHistoryLength = 50
  //   logger?: (
  //     type: Actions,
  //     when: "beforeAction" | "afterAction",
  //     state: IFlowchartState
  //   ) => void
): [
  IFlowchartState,
  React.Dispatch<{
    type: Actions;
    payload: DiagramEventArgs;
  }>,
  UndoRedoManager<IChart>
] => {
  const history = React.useRef<UndoRedoManager<IChart>>();
  if (!history.current) {
    history.current = new UndoRedoManager<IChart>(
      initialState.chart,
      maxHistoryLength
    );
  }

  const [appState, dispatch] = React.useReducer(reducer, initialState);
  const wrappedDispatch: React.Dispatch<{
    type: Actions;
    payload: DiagramEventArgs;
  }> = (value: { type: Actions; payload: DiagramEventArgs }) => {
    onStateChanging(appState, value.type, value.payload);
    dispatch({ type: value.type, payload: value.payload });
  };

  React.useEffect(() => {
    if (!appState.changeSummary.lastAction) {
      return;
    }
    history.current?.save(
      appState.chart,
      appState.changeSummary.lastAction as Actions
    );
    onStateChanged(appState, appState.changeSummary.lastAction as Actions);
    // eslint-disable-next-line
  }, [appState.changeSummary.totalActions, onStateChanged]);

  return [appState, wrappedDispatch, history.current];
};
