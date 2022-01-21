import {
  ChartAction,
  ChartDispatch,
  ChartEvents,
  ChartStore,
  SimpleChartAction,
} from "./definitions";

export function composeMiddleware(...fns: any[]) {
  if (fns.length === 0) return (arg: any) => arg;
  if (fns.length === 1) return fns[0];
  return fns.reduce(
    (a, b) =>
      (...args: any[]) =>
        a(b(...args))
  );
}

export function logMiddleware(store: ChartStore) {
  return (next: ChartDispatch) => (action: ChartAction) => {
    console.log("Prev State:", store.getState());
    console.log("Action:", action);
    next(action);
    console.log("Next State:", store.getState());
  };
}

export function thunkMiddleware(store: ChartStore) {
  return (next: ChartDispatch) => (action: ChartAction) => {
    if (typeof action === "function") {
      // Inject the store
      return action(store);
    }
    // Otherwise, pass the action down the middleware chain as usual
    return next(action);
  };
}

export function eventBusMiddleware(store: ChartStore) {
  return (next: ChartDispatch) => (action: ChartAction) => {
    const type = (action as SimpleChartAction).type as ChartEvents;
    if (type.startsWith("evt-")) {
      return store
        .getEventBus()
        .emit(type, (action as SimpleChartAction).payload);
    }
    const prevState = store.getState();
    // Otherwise, pass the action down the middleware chain as usual
    next(action);
    store.getEventBus().emit("evt-stateChanged", {
      prev: prevState,
      next: store.getState(),
      action,
    });
  };
}
