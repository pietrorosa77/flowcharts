import React from "react";
import ReactDOM from "react-dom";
import { getInitialSchema } from "./src/flowchart/utils";
import { ExtendedNode } from "./src/flowchart/definitions";
import { nanoid } from "nanoid";
import FlowDiagramEditor from "./src/flowchart/FlowChart";

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

const onDiagramChanged = (state: any, type: any) => {
  const actions = [
    "onUpdateNode",
    "onNodeAdded",
    "onDeleteNodes",
    "onUndo",
    "onRedo",
  ];
  if (actions.includes(type)) {
  
    // const updtVariables = getAllVariables(state.chart);
    // setVariables(updtVariables);
  }
};

ReactDOM.render(
  <React.StrictMode>
    <FlowDiagramEditor
      //width="500px"
      //height="500px"
      nodeSize={250}
      log
      chart={initialChart}
      sidebarInitiallyOpened
      sidebarButtons={availableNodes}
      name="My flowchart"
      onDiagramChanged={onDiagramChanged}
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
