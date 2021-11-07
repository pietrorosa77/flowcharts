import * as React from "react";
import { Box, TextInput, Text, ThemeContext } from "grommet";
import { INodePanelEditor, IPort } from "../definitions";
import { MarkdownEditor } from "./DefaultContentEditor";
import PortsEditor from "./DefaultPortEditor";
import ReactJsonView from "react-json-view";

export default function DefaultPropertyPanelEditor(props: INodePanelEditor) {
  const theme: any = React.useContext(ThemeContext);
  const [nodePropsError, setNodePropsError] = React.useState("");
  const node = props.node;

  const onContentChange = (evt: { content: string }) => {
    const newNode = {
      ...node,
      content: evt.content,
    };

    props.onNodeChange(newNode);
  };

  const onTitleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const newNode = {
      ...node,
      title: evt.target.value,
    };

    props.onNodeChange(newNode);
  };

  const onChangePorts = (ports: { [key: string]: IPort }) => {
    const newNode = {
      ...node,
      ports,
    };

    props.onNodeChange(newNode);
  };

  const onEditProperties = (evt: any) => {
    const result = props.nodePropertiesValidator(evt.updated_src);
    setNodePropsError(result.error || "");
    if (result.error) {
      return false;
    }
    const newNode = { ...node, properties: evt.updated_src };
    props.onNodeChange(newNode);
    return true;
  };

  return (
    <Box pad="none" gap="small">
      <Box pad="xsmall">
        <Text size="small">Node title</Text>
      </Box>
      <TextInput
        placeholder="set node title"
        value={node.title}
        onChange={onTitleChange}
      />
      <MarkdownEditor
        value={node.content}
        onContentChange={onContentChange}
        label="Edit node content"
        renderNode={props.renderNode}
      />
      <PortsEditor
        ports={node.ports}
        label="Edit node ports"
        onChange={onChangePorts}
        renderPort={props.renderPort}
        portPropertiesValidator={props.portPropertiesValidator}
      />

      <Box pad="xsmall">
        <Text size="small">Node properties</Text>
      </Box>
      <ReactJsonView
        theme={theme.jsonEditor.theme}
        validationMessage={nodePropsError}
        name="properties"
        collapseStringsAfterLength={20}
        src={node.properties || {}}
        onAdd={onEditProperties}
        onEdit={onEditProperties}
        onDelete={onEditProperties}
        enableClipboard={false}
      />
    </Box>
  );
}
