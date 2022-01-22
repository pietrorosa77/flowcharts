import React from "react";
import { Box } from "grommet";
import { FormClose, FormCheckmark } from "grommet-icons";
import { ExtendedNode, INode, INodePanelEditor, IPort } from "./definitions";
import { CollapsibleLeftPanel } from "./CollapsibleLeftPanel";
import { StyledButton } from "./ActionButton";
import { DefaultPropertyPanelEditor } from "./Index";
import { EventBusContext } from "./eventBus";

interface IPropertyPanelProps {

  width: string;
  // onNodeUpdated: (node: INode) => void;
  customData?: { [key: string]: any };
  customEditors?: Map<string, (props: INodePanelEditor) => JSX.Element>;
  renderNode?: (node: INode) => JSX.Element;
  renderPort?: (port: IPort) => JSX.Element;
  nodePropertiesValidator?: (newProps: { [key: string]: any }) => {
    error: string | undefined;
  };
  portPropertiesValidator?: (newProps: { [key: string]: any }) => {
    error: string | undefined;
  };
}

export const PropertyPanel = ({
  customData,
  customEditors,
  nodePropertiesValidator,
  portPropertiesValidator,
  renderNode,
  renderPort,
  width,
}: IPropertyPanelProps) => {
  const bus = React.useContext(EventBusContext);
  const [nodeState, setNodeState] = React.useState<ExtendedNode>();
  const customPanels = customEditors || new Map();


  //const [opened, setOpened] = React.useState(initiallyOpened);

  React.useEffect(() => {
    const handler = bus.subscribe(
      "evt-nodesettings",
      (evt: ExtendedNode) => {
        setNodeState(evt);
      }
    );
    return () => bus.unSubscribe("evt-nodesettings", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onNodeChange = (evt: ExtendedNode) => {
    setNodeState({ ...nodeState, ...evt });
  };

  const onSave = () => {
    bus.emit("evt-nodeupdated", nodeState);
    setNodeState(undefined);
  };

  const NodePanel = nodeState
    ? customPanels.get(nodeState.type) || DefaultPropertyPanelEditor
    : null;

  const onClose = () => setNodeState(undefined);

  return (
    <CollapsibleLeftPanel
      opened={!!nodeState}
      width={width}
      onClose={onClose}
      title={`Node ${nodeState?.title} settings`}
    >
      <div
        style={{
          overflow: "auto",
          width: "100%",
          height: "100%",
          padding: "6px",
          boxSizing: "border-box",
        }}
        className="ppanel"
      >
        {nodeState && NodePanel && (
          <NodePanel
            key={`nodepanel-${nodeState.id}`}
            node={nodeState as INode}
            customData={customData}
            renderNode={renderNode}
            renderPort={renderPort}
            nodePropertiesValidator={nodePropertiesValidator}
            portPropertiesValidator={portPropertiesValidator}
            onNodeChange={onNodeChange}
          />
        )}
      </div>
      <Box
        direction="row"
        align="center"
        as="footer"
        gap="small"
        height="50px"
        pad="medium"
        justify="center"
        background="bars"
      >
        <StyledButton
          style={{ borderRadius: "6px", width: "110px" }}
          icon={<FormClose />}
          label="Cancel"
          color="white"
          bgColor="status-error"
          onClick={onClose}
          opacity={0.7}
        />

        <StyledButton
          style={{ borderRadius: "6px", width: "110px" }}
          icon={<FormCheckmark />}
          label="Apply"
          color="white"
          bgColor="status-ok"
          onClick={onSave}
          opacity={0.7}
        />
      </Box>
    </CollapsibleLeftPanel>
  );
};
