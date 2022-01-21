import React from "react";
import { Box } from "grommet";
import { FormClose, FormCheckmark } from "grommet-icons";
import { ExtendedNode, INode, INodePanelEditor, IPort } from "./definitions";
import { CollapsibleLeftPanel } from "./CollapsibleLeftPanel";
import { StyledButton } from "./ActionButton";
import { DefaultPropertyPanelEditor } from "./Index";

interface IPropertyPanelProps {
  node?: ExtendedNode;
  width: string;
  onClose: () => void;
  onNodeUpdated: (node: INode) => void;
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
  node,
  onClose,
  onNodeUpdated,
  customData,
  customEditors,
  nodePropertiesValidator,
  portPropertiesValidator,
  renderNode,
  renderPort,
  width,
}: IPropertyPanelProps) => {
  const [nodeState, setNodeState] = React.useState<ExtendedNode | undefined>(
    node
  );
  const nodeId = node ? node.id : undefined;
  const opened = node ? true : false;
  const customPanels = customEditors || new Map();

  React.useEffect(() => {
    if (!node) {
      return;
    }
    setNodeState(node);
    // eslint-disable-next-line
  }, [nodeId]);

  const onNodeChange = (evt: ExtendedNode) => {
    setNodeState({ ...node, ...evt });
  };

  const onSave = () => {
    onNodeUpdated(nodeState as ExtendedNode);
    onClose();
  };

  const NodePanel = nodeState
    ? customPanels.get(nodeState.type) || DefaultPropertyPanelEditor
    : null;

  return (
    <CollapsibleLeftPanel
      opened={opened}
      width={width}
      onClose={onClose}
      title={`Node ${node?.title} settings`}
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
        {opened && node && NodePanel && (
          <NodePanel
            key={`nodepanel-${(node as INode).id}`}
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
