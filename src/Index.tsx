import React from "react";
import ReactDOM from "react-dom";
import { getInitialSchema } from "./flowchart/utils";
import { ExtendedNode } from "./flowchart/definitions";
import { nanoid } from "nanoid";
import FlowDiagramEditor from "./flowchart/FlowChart";

const initialChart = getInitialSchema();
const availableNodes: ExtendedNode[] = [
  {
    id: nanoid(9),
    content: "Your brand new node.",
    position: {
      x: 0,
      y: 0,
    },
    title: "New Node",
    ports: {
      port1: {
        bgColor: "brand",
        id: "port1",
        text: "port 1",
        index: 0,
        properties: {},
      },
    },
  },
];

ReactDOM.render(
  <React.StrictMode>
    <FlowDiagramEditor
      //width="500px"
      //height="500px"
      nodeSize={250}
      chart={initialChart}
      sidebarButtons={availableNodes}
      name="My flowchart"
      // canvasContainerBgColor="blue"
      // canvasBackground={{
      //   height: 5000,
      //   width: 5000,
      //   backgroundColor: "green",
      // }}
      // theme={{
      //   global: {
      //     colors: {
      //       brand: "#7D4CDB",
      //       bars: "#00739D",
      //       "dark-1": "#6FFFB0",
      //     },
      //   },
      //   jsonEditor: {
      //     theme: "rjv-default",
      //   },
      // }}
      // renderNode={(node: INode) => <>{node.content}</>}
      // renderPort={(port: IPort) => {
      //   return (
      //     <div style={{ textAlign: "center", display: "block", width: "100%" }}>
      //       {port.properties.icon && (
      //         <img src={port.properties.icon} width="30px" height="auto" />
      //       )}
      //       {port.text}
      //     </div>
      //   );
      // }}
    />
  </React.StrictMode>,
  document.getElementById("root")
);