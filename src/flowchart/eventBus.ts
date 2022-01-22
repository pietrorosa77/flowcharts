import { nanoid } from "nanoid";
import { createContext } from "react";
import {
  ChartEventBusUnsubscibeHandle,
  ChartEvents,
  IChartEventBus,
} from "./definitions";

let _bus: Comment;
let _observer: ResizeObserver;
let _zoomscale = { scale: 1, x: 0, y: 0 };

const subscribe = (
  event: ChartEvents,
  callback: (data?: any) => void,
  options?: AddEventListenerOptions
): ChartEventBusUnsubscibeHandle => {
  const cb = (event: CustomEvent) => {
    const eventData = event.detail;
    callback(eventData);
  };
  _bus.addEventListener(
    event,
    cb as EventListenerOrEventListenerObject,
    options || { passive: true }
  );
  return cb;
};

const unSubscribe = (
  event: ChartEvents,
  unsubscribeHandle: ChartEventBusUnsubscibeHandle,
  options?: AddEventListenerOptions
) => {
  _bus.removeEventListener(
    event,
    unsubscribeHandle as EventListenerOrEventListenerObject,
    options
  );
};

const emit = (type: ChartEvents, data: any) => {
  const event = new CustomEvent(type, {
    detail: data,
  });
  requestAnimationFrame(() => _bus.dispatchEvent(event));
};

const observeElementSize = (
  element: Element,
  options?: ResizeObserverOptions | undefined
) => {
  _observer.observe(element, options);
};

const unobserveElementSize = (element: Element) => {
  _observer.unobserve(element);
};

const stopSizeObserver = () => {
  _observer.disconnect();
};

const storeDiagramZoomScale = (data: {
  scale: number;
  x: number;
  y: number;
}) => {
  _zoomscale = data;
};

const getDiagramZoomScale = () => _zoomscale || { scale: 1, x: 0, y: 0 };

export const createBus = (): IChartEventBus => {
  if (!_bus) {
    _bus = document.appendChild(
      new Comment(`dmbtFlowchart-event-bus${nanoid(10)}`)
    );
  }

  if (!_observer) {
    _observer = new ResizeObserver((changes: ResizeObserverEntry[]) =>
      emit("evt-nodessizechanged", changes)
    );
  }

  return {
    subscribe,
    unSubscribe,
    emit,
    storeDiagramZoomScale,
    getDiagramZoomScale,
    observeElementSize,
    unobserveElementSize,
    stopSizeObserver,
  };
};

export const EventBusContext: React.Context<IChartEventBus> =
  createContext<IChartEventBus>(createBus());
