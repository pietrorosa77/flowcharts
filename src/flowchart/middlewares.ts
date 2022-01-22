import { ChartAction, ChartDispatch, ChartStore } from "./definitions";

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
