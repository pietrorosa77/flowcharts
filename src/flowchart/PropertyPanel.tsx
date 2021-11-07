import React from "react";
import { Box } from "grommet";
import { FormClose, FormCheckmark } from "grommet-icons";
import { INode, INodePanelEditor, IPort } from "./definitions";
import { CollapsibleLeftPanel } from "./CollapsibleLeftPanel";
import { StyledButton } from "./ActionButton";

interface IPropertyPanelProps {
  node?: INode;
  width: string;
  onClose: () => void;
  onNodeUpdated: (node: INode) => void;
  onLoadPropertyPanel?: (
    node: INode
  ) => Promise<
    React.LazyExoticComponent<React.ComponentType<INodePanelEditor>>
  >;
  customData?: { [key: string]: any };
  renderNode?: (node: INode) => JSX.Element;
  renderPort?: (port: IPort) => JSX.Element;
  nodePropertiesValidator: (newProps: { [key: string]: any }) => {
    error: string | undefined;
  };
  portPropertiesValidator: (newProps: { [key: string]: any }) => {
    error: string | undefined;
  };
}

const importDefaultPropertyPanel = async () => {
  return React.lazy(() =>
    import(`./default-editors/DefaultPropertyPanelEditor`).catch(
      () => (<div>error rendering panel</div>) as any
    )
  );
};

export const PropertyPanel = ({
  node,
  onClose,
  onNodeUpdated,
  customData,
  onLoadPropertyPanel,
  nodePropertiesValidator,
  portPropertiesValidator,
  renderNode,
  renderPort,
  width,
}: IPropertyPanelProps) => {
  const [NodePanel, setPanel] =
    React.useState<React.ComponentType<INodePanelEditor>>();
  const [nodeState, setNodeState] = React.useState<INode>();
  const nodeId = node ? node.id : undefined;
  const opened = node ? true : false;
  React.useEffect(() => {
    if (!node) {
      return;
    }

    async function loadPanel(node: INode) {
      let NodePanelRes: React.ComponentType<INodePanelEditor>;
      if (onLoadPropertyPanel) {
        NodePanelRes = await onLoadPropertyPanel(node);
      } else {
        NodePanelRes = await importDefaultPropertyPanel();
      }
      setPanel(NodePanelRes);
    }

    loadPanel(node);
    setNodeState(node);
    // eslint-disable-next-line
  }, [nodeId]);

  const onNodeChange = (evt: INode) => {
    setNodeState({ ...node, ...evt });
  };

  const onSave = () => {
    onNodeUpdated(nodeState as INode);
    onClose();
  };

  return (
    <CollapsibleLeftPanel
      opened={opened}
      width={width}
      onClose={onClose}
      title={`Node ${node?.title} settings`}
    >
      <React.Suspense fallback={<div>Loading</div>}>
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
          {opened && NodePanel && (
            <NodePanel
              key={`nodepanel-${(node as INode).id}`}
              node={nodeState as INode}
              customData={customData}
              renderPort={renderPort}
              nodePropertiesValidator={nodePropertiesValidator}
              portPropertiesValidator={portPropertiesValidator}
              renderNode={renderNode}
              onNodeChange={onNodeChange}
            />
          )}
        </div>
      </React.Suspense>
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
