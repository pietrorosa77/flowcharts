import React from "react";
import { Actions, DiagramEventArgs, IFlowchartState } from "./definitions";
//import { UndoRedoManager } from "./undo-redo";

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
  onStateChanged: (state: IFlowchartState, type: Actions) => void
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
  }>
  //UndoRedoManager
] => {
  //const history = React.useRef<UndoRedoManager>();
  // if (!history.current) {
  //   history.current = new UndoRedoManager(initialState.chart);
  // }

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
    // if (!["onNodeAdded"].includes(appState.changeSummary.lastAction)) {
    //   history.current?.save(appState.chart);
    // }
    onStateChanged(appState, appState.changeSummary.lastAction as Actions);
    // eslint-disable-next-line
  }, [appState.changeSummary.totalActions, onStateChanged]);

  return [appState, wrappedDispatch];
};
