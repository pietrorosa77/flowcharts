import React from "react";

import { Box, Text } from "grommet";
import styled from "styled-components";
import { FormClose } from "grommet-icons";
import { ActionButton } from "./ActionButton";

export const PanelContainer = styled.div<{
  width: string;
  opacity: string | number;
}>`
  position: absolute;
  top: 0;
  left: -${(props) => props.width};
  z-index: 99999;
  opacity: ${(props) => props.opacity};
  width: ${(props) => props.width};
  max-width: ${(props) => props.width};
  min-width: ${(props) => props.width};
  height: 100%;

  &.closed {
    left: -${(props) => props.width};
    transition: 0.5s;
  }

  &.opened {
    left: 0;
    transition: 0.5s;
  }
` as any;

export interface ICollapsiblePanelProps {
  opened: boolean;
  onClose: () => void;
  width: string;
  title: string;
  children: any;
  bgColor?: string;
  headBgColor?: string;
  opacity?: string | number;
}

export const CollapsibleLeftPanel = ({
  opened,
  onClose,
  width,
  children,
  title,
  bgColor,
  headBgColor,
  opacity,
}: ICollapsiblePanelProps) => {
  const [renderElements, setRenderElements] = React.useState(true);
  const timer = React.useRef<any>(0);
  React.useEffect(() => {
    clearTimeout(timer.current);
    if (opened) {
      setRenderElements(true);
    } else {
      timer.current = setTimeout(() => setRenderElements(false), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  return (
    <PanelContainer
      width={width}
      opacity={opacity || 1}
      className={opened ? "opened" : "closed"}
    >
      {renderElements && (
        <Box
          fill
          style={{ minWidth: width, maxWidth: width, opacity: 1 }}
          background={bgColor || "brand"}
        >
          <Box
            background={headBgColor || "bars"}
            direction="row"
            align="center"
            as="header"
            justify="between"
            height="50px"
            pad="medium"
          >
            <Text margin={{ left: "small" }}>{title}</Text>
            <ActionButton
              icon={<FormClose />}
              onClick={onClose}
              size="small"
              bgColor={headBgColor || "bars"}
              style={{ padding: "2px" }}
            />
          </Box>
          {children}
        </Box>
      )}
    </PanelContainer>
  );
};
