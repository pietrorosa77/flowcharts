import * as React from "react";
import { IDiagramContext } from "./definitions";

const DiagramContext: React.Context<IDiagramContext> =
  React.createContext<IDiagramContext>({
    scale: 0,
    x: 0,
    y: 0,
    minZoom: 0,
    maxZoom: 1,
  });

export default DiagramContext;
