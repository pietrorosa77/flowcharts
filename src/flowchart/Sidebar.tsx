import React from "react";

import { Box } from "grommet";
import { EmptyCircle } from "grommet-icons";
import { ExtendedNode, INode, IToggleSidebarEvent } from "./definitions";
import { nanoid } from "nanoid";
import { CollapsibleLeftPanel } from "./CollapsibleLeftPanel";
import { StyledButton } from "./ActionButton";
import { DispatcherContext } from "./reducer";

export interface ISidebarProps {
  initiallyOpened?: boolean;
  buttons:
    | ExtendedNode[]
    | {
        id: string;
        title: string;
        icon: string;
        getNode: () => ExtendedNode;
      }[];
  width: string;
}

const getNode = (node: ExtendedNode): ExtendedNode => {
  return {
    ...node,
    id: nanoid(21),
  };
};

export const Sidebar = ({ initiallyOpened, buttons, width }: ISidebarProps) => {
  const { dispatcher: dispatch, bus } = React.useContext(DispatcherContext);
  const [opened, setOpened] = React.useState(initiallyOpened);

  React.useEffect(() => {
    const handler = bus.subscribe(
      "evt-toggleSidebar",
      (evt: IToggleSidebarEvent) => {
        setOpened(evt.opened);
      }
    );
    return () => bus.unSubscribe("evt-toggleSidebar", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDragStart = (event: any, node: INode) => {
    event.persist();
    const current = event.currentTarget as any;
    current.classList.add("dragging");
    event.dataTransfer.setData("DIAGRAM-BLOCK", JSON.stringify(node));
    return true;
  };

  const onClose = () => {
    setOpened(false);
    dispatch({ type: "evt-toggleSidebar", payload: { opened: false } });
  };

  const onDragEnd = (event: any) => {
    event.persist();
    const current = event.currentTarget as any;
    current.classList.remove("dragging");
    return true;
  };

  return (
    <CollapsibleLeftPanel
      opened={opened || false}
      opacity={0.8}
      width={width}
      onClose={onClose}
      title="Select Node"
    >
      <React.Suspense fallback="Loading views...">
        <Box flex overflow="auto" pad="small" gap="small">
          {buttons.map((btn) => (
            <StyledButton
              key={btn.id}
              draggable={true}
              style={{ borderRadius: "6px", minHeight: "50px", width: "100%" }}
              icon={btn.icon || <EmptyCircle />}
              label={btn.title}
              color="status-disabled"
              bgColor="bars"
              accentColor="accent-1"
              onDragStart={(event: any) =>
                onDragStart(
                  event,
                  btn.getNode ? btn.getNode() : getNode(btn as ExtendedNode)
                )
              }
              onDragEnd={(event: any) => onDragEnd(event)}
              opacity={0.7}
            />
          ))}
        </Box>
      </React.Suspense>
    </CollapsibleLeftPanel>
  );
};
