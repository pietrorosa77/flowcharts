import {
  ChartEventBusUnsubscibeHandle,
  ChartEvents,
  IChartEventBus,
} from "./definitions";

let _bus: Comment;

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
    options
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

export const useEventBus = (): IChartEventBus => {
  if (!_bus) {
    _bus = document.appendChild(new Comment("dmbtFlowchart-event-bus"));
  }

  return {
    subscribe,
    unSubscribe,
    emit,
  };
};
