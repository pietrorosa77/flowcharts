import * as React from "react";
import MDEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { INode } from "../definitions";
import { nanoid } from "nanoid";
import { getNodeRenderer } from "../utils";
import { Box, Text } from "grommet";

const ContentEditor = MDEditor as any;
interface IMarkdownEditorProps {
  value: string;
  label: string;
  plugins?: string[];
  style?: React.CSSProperties;
  onEditorLoaded?: (editor: MDEditor) => void;
  onContentChange: (evt: { content: string }) => void;
  renderNode?: (node: INode) => JSX.Element;
  name?: string;
  customProps?: {
    [key: string]: any;
  };
}

export function MarkdownEditor(props: IMarkdownEditorProps) {
  React.useEffect(() => {
    if (props.onEditorLoaded) {
      props.onEditorLoaded(ContentEditor);
    }
    // eslint-disable-next-line
  }, [true]);

  function onImageUpload(file: any) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (data: any) => {
        resolve(data.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  const node: INode = {
    content: props.value,
    id: nanoid(),
    ports: {},
    position: { x: 0, y: 0 },
    title: "",
  };

  return (
    <Box>
      <Box
        pad="xsmall"
        align="center"
        gap="small"
        background="brand"
        direction="row"
      >
        <Text size="small">{props.label}</Text>
      </Box>

      <ContentEditor
        style={props.style}
        onImageUpload={onImageUpload}
        value={props.value}
        name={props.name}
        plugins={[
          "header",
          "font-bold",
          "font-italic",
          "font-underline",
          "list-ordered",
          "block-quote",
          "block-wrap",
          "block-code-inline",
          "table",
          "image",
          "link",
          "mode-toggle",
          "full-screen",
        ]}
        markdownClass="md-editor-textarea"
        renderHTML={(content: string) =>
          getNodeRenderer({ ...node, content }, props.renderNode)
        }
        config={{
          view: { menu: true, md: true, html: true },
        }}
        onChange={(data: { text: string }) =>
          props.onContentChange({ content: data.text })
        }
        {...(props.customProps || {})}
      />
    </Box>
  );
}
