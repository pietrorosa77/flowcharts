import * as React from "react";
import Panzoom, { PanzoomObject } from "@panzoom/panzoom";
import { EventBusContext } from "./eventBus";
export interface IPanZoomLayerProps {
  height?: string;
  width?: string;
  children?: any;
}

export function ZoomLayer(props: IPanZoomLayerProps) {
  const bus = React.useContext(EventBusContext);
  const container = React.useRef<HTMLDivElement>(null);
  const panzoom = React.useRef<PanzoomObject>();

  const zoomHandler = (event: any) => {
    if (!event.shiftKey || !panzoom.current) return;
    panzoom.current.zoomWithWheel(event);
  };

  const onPanZoomChange = (event: any) => {
    bus.storeDiagramZoomScale(event.detail);
  };

  const enablePanzoom = () => {
    if (!container.current) {
      return;
    }

    const panzoomCurrentData = bus.getDiagramZoomScale();

    panzoom.current = Panzoom(container.current, {
      maxScale: 5,
      startScale: panzoomCurrentData.scale,
      startX: panzoomCurrentData.x,
      startY: panzoomCurrentData.y,
    });

    container.current.parentElement?.addEventListener("wheel", zoomHandler, {
      passive: false,
    });
    container.current.addEventListener("panzoomchange", onPanZoomChange);
  };

  const disablePanzoom = () => {
    if (!panzoom.current || !container.current) {
      return;
    }

    panzoom.current.destroy();
    container.current.style.cursor = "crosshair";
    container.current.parentElement?.removeEventListener("wheel", zoomHandler);
    container.current.removeEventListener("panzoomchange", onPanZoomChange);
  };

  React.useEffect(() => {
    const hdRest = bus.subscribe("evt-resetpanzoom", () => {
      if (panzoom.current) {
        panzoom.current.setOptions({ startX: 0, startY: 0, startScale: 1 });
        panzoom.current.reset({
          animate: true,
          startX: 0,
          startY: 0,
          startScale: 1,
        });
        bus.storeDiagramZoomScale({ x: 0, y: 0, scale: 1 });
      }
    });
    const hd = bus.subscribe("evt-togglepanzoom", (enable: boolean) => {
      if (enable) {
        enablePanzoom();
      } else {
        disablePanzoom();
      }
    });
    return () => {
      bus.unSubscribe("evt-toggleSidebar", hd);
      bus.unSubscribe("evt-resetpanzoom", hdRest);
      disablePanzoom();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div
      role="presentation"
      ref={container}
      style={{
        height: props.height,
        userSelect: "none",
        width: props.width,
      }}
    >
      {props.children}
    </div>
  );
}
