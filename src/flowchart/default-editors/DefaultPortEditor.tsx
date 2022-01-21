import * as React from "react";
import { IPort } from "../definitions";
import { ActionButton } from "../ActionButton";
import { Add, Configure, Paint, Trash } from "grommet-icons";
import { Box, Collapsible, Text, TextInput, ThemeContext } from "grommet";
import { nanoid } from "nanoid";
import ReactJsonView from "react-json-view";

export default function PortsEditor(props: {
  ports: { [key: string]: IPort };
  label?: string;
  renderPort?: (port: IPort) => JSX.Element;
  onChange: (ports: { [key: string]: IPort }) => void;
  portPropertiesValidator?: (newProps: { [key: string]: any }) => {
    error: string | undefined;
  };
}) {
  const theme: any = React.useContext(ThemeContext);
  const [portPropsError, setportPropsError] = React.useState("");
  const [activeId, setActiveId] = React.useState("");
  const ports = props.ports;
  const portsArray: IPort[] = Object.keys(ports || {})
    .map((key) => ports[key])
    .sort((p1, p2) => p1.index - p2.index);

  const onChange = (newList: IPort[]) => {
    const portObject = newList.reduce((acc, curr) => {
      return {
        ...acc,
        [curr.id]: {
          ...curr,
        },
      };
    }, {});
    props.onChange(portObject);
  };

  const onAddPort = () => {
    const index = portsArray.length + 1;
    const id = nanoid();
    const text = `exit port`;
    const newArray = portsArray.concat({
      bgColor: "options",
      id,
      text,
      index,
      properties: {},
    });
    onChange(newArray);
  };

  const onPortTextChange = (text: string, port: IPort) => {
    const newArray = portsArray.map((p) =>
      p.id === port.id
        ? {
            ...p,
            text,
          }
        : p
    );
    onChange(newArray);
  };

  const onPortcolorChange = (bgColor: string, port: IPort) => {
    const newArray = portsArray.map((p) =>
      p.id === port.id
        ? {
            ...p,
            bgColor,
          }
        : p
    );
    onChange(newArray);
  };

  const onRemovePort = (id: string) => {
    const newArray = portsArray
      .filter((el) => el.id !== id)
      .map((p, i) => ({
        ...p,
        index: i + 1,
      }));
    onChange(newArray);
  };

  const onEditProperties = (port: IPort, evt: any) => {
    const result = props.portPropertiesValidator
      ? props.portPropertiesValidator(evt.updated_src)
      : evt.updated_src;
    setportPropsError(result.error || "");
    if (result.error) {
      return false;
    }
    const newPort = { ...port, properties: evt.updated_src };
    const newArray = portsArray.map((el) =>
      el.id === newPort.id ? newPort : el
    );
    onChange(newArray);
    return true;
  };

  return (
    <Box pad="none" gap="small" height="100%" width="100%">
      <Box
        pad="xsmall"
        align="center"
        gap="small"
        background="brand"
        direction="row"
      >
        <Text size="small" style={{ flex: 1 }}>
          {props.label || "Add flow port"}
        </Text>
        <ActionButton
          icon={<Add size="small" />}
          onClick={onAddPort}
          size="small"
        />
      </Box>
      {portsArray.map((item: IPort) => (
        <div key={item.id}>
          <Box
            key={item.id}
            pad="small"
            align="center"
            gap="small"
            background="bars"
            direction="row"
          >
            <Box background={item.bgColor} flex="grow">
              <TextInput
                value={item.text}
                textAlign="center"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onPortTextChange(e.target.value, item)
                }
              />
            </Box>
            <div style={{ position: "relative" }}>
              <input
                type="color"
                id={`cpick-${item.id}`}
                style={{
                  height: "40px",
                  width: "40px",
                  cursor: "pointer",
                  border: "none",
                  opacity: 0,
                  backgroundColor: "transparent",
                }}
                value={theme.global.colors[item.bgColor] || item.bgColor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onPortcolorChange(e.target.value, item)
                }
              />
              <ActionButton
                style={{ position: "absolute", left: "0px" }}
                icon={<Paint size="small" />}
                bgColor={theme.global.colors[item.bgColor] || item.bgColor}
                onClick={() => {
                  document.getElementById(`cpick-${item.id}`)?.click();
                }}
                size="small"
              />
            </div>
            <ActionButton
              tip="properties"
              icon={<Configure size="small" />}
              onClick={() => setActiveId(activeId === item.id ? "" : item.id)}
              size="small"
            />
            {portsArray.length > 1 && (
              <ActionButton
                icon={<Trash size="small" />}
                onClick={() => onRemovePort(item.id)}
                size="small"
              />
            )}
          </Box>
          <Collapsible open={activeId === item.id}>
            <Box background="bars">
              <ReactJsonView
                theme={theme.jsonEditor.theme}
                validationMessage={portPropsError}
                name="properties"
                collapseStringsAfterLength={20}
                src={item.properties || {}}
                onAdd={(data: any) => onEditProperties(item, data)}
                onEdit={(data: any) => onEditProperties(item, data)}
                onDelete={(data: any) => onEditProperties(item, data)}
                enableClipboard={false}
              />
              {props.renderPort ? (
                <Box>
                  <Box pad="xsmall">
                    <Text size="small">port preview</Text>
                  </Box>
                  <Box background="dark-1">{props.renderPort(item)}</Box>
                </Box>
              ) : null}
            </Box>
          </Collapsible>
        </div>
      ))}
    </Box>
  );
}
