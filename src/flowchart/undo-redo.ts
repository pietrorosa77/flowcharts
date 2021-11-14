import { DebouncedFunc, isEqual, throttle } from "lodash";
import { IChart } from "./definitions";
type UndoRedoState = {
  past: IChart[];
  present: IChart;
  future: IChart[];
};
export class UndoRedoManager {
  current: UndoRedoState;
  throttledReducer: DebouncedFunc<
    (
      oldState: UndoRedoState,
      action: {
        type: "undo" | "redo" | "save" | "reset";
        payload?: IChart | undefined;
      }
    ) => UndoRedoState
  >;
  constructor(initialState: IChart) {
    this.current = {
      past: [],
      present: initialState,
      future: [],
    };

    this.throttledReducer = throttle(this.reducer, 500, {
      trailing: true,
    });
  }

  reducer = (
    oldState: UndoRedoState,
    action: { type: "undo" | "redo" | "save" | "reset"; payload?: IChart }
  ): UndoRedoState => {
    const { past, present, future } = oldState;
    let ret = {
      ...oldState,
    };

    switch (action.type) {
      case "undo":
        if (past.length > 0) {
          const previous = past[past.length - 1];
          const newPast = past.slice(0, past.length - 1);
          ret = {
            past: newPast,
            present: previous,
            future: [present, ...future],
          };
        }
        break;

      case "redo":
        if (future.length > 0) {
          const next = future[0];
          const newFuture = future.slice(1);

          ret = {
            past: [...past, present],
            present: next,
            future: newFuture,
          };
        }

        break;

      case "save":
        if (!present || !isEqual(action.payload, present)) {
          ret = {
            past: [...past, present],
            present: action.payload as IChart,
            future: [],
          };
        }
        break;

      case "reset":
        ret = {
          past: [],
          present: action.payload as IChart,
          future: [],
        };
        break;
    }
    console.log("undred manager reducer ", ret);
    return ret;
  };

  save(currentState: IChart): void {
    this.current = this.throttledReducer(this.current, {
      type: "save",
      payload: currentState,
    }) as UndoRedoState;
    console.log("THIS.CURRENT", this.current);
  }

  canUndo(): boolean {
    return this.current.past.length > 0;
  }

  canRedo(): boolean {
    return this.current.future.length > 0;
  }

  undo() {
    this.current = this.reducer(this.current, { type: "undo" });
    return this.current.present;
  }

  redo() {
    this.current = this.reducer(this.current, { type: "redo" });
    return this.current.present;
  }
}
