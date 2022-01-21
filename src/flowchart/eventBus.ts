import { createContext } from "react";
import {
  ChartEventBusUnsubscibeHandle,
  ChartEvents,
  IChartEventBus,
} from "./definitions";

let _bus: Comment;

let _zoomscale = 1;

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
  _bus.dispatchEvent(event);
};

const storeDiagramZoomScale = (scale: number) => {
  _zoomscale = scale;
};

const getDiagramZoomScale = () => _zoomscale || 1;

export const createBus = (): IChartEventBus => {
  if (!_bus) {
    _bus = document.appendChild(new Comment("dmbtFlowchart-event-bus"));
  }

  return {
    subscribe,
    unSubscribe,
    emit,
    storeDiagramZoomScale,
    getDiagramZoomScale,
  };
};

export const EventBusContext: React.Context<IChartEventBus> =
  createContext<IChartEventBus>(createBus());
