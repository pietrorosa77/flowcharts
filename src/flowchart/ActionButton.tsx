import { Box, Button, Heading, Layer, Paragraph } from "grommet";
import { FormCheckmark, FormClose } from "grommet-icons";
import React from "react";
import styled from "styled-components";

export const ActionButton = styled(Button)<{
  bgColor?: string;
  fontColor?: string;
  plain?: boolean;
  noOutline?: boolean;
  active?: boolean;
}>`
  background-color: ${(props) =>
    props.theme.global.colors[props.bgColor || "brand"] || props.bgColor};
  border: ${(props) =>
    !props.plain
      ? `2px solid ${props.theme.global.colors[props.fontColor || "neutral-3"]}`
      : "none"};
  border-radius: 50%;
  color: ${(props) => props.theme.global.colors[props.fontColor || "unset"]};
  svg {
    fill: ${(props) =>
      props.theme.global.colors[
        props.active ? "accent-1" : props.fontColor || "unset"
      ]};
    stroke: ${(props) =>
      props.theme.global.colors[
        props.active ? "accent-1" : props.fontColor || "unset"
      ]};
  }

  &: hover
    ${(props) =>
      props.disabled
        ? undefined
        : `
  {
    transform: scale(1.1);
    transition: 0.3s ease-out;
    box-shadow: ${
      props.noOutline
        ? "none"
        : `0 0 2px 2px ${props.theme.global.colors["accent-1"]}`
    };
    color: ${props.theme.global.colors["accent-1"]};
    opacity: 0.9;
    svg {
      fill: ${props.theme.global.colors["accent-1"]};
      stroke: ${props.theme.global.colors["accent-1"]};
    }
  }
  `};
`;

export function ConfirmButton(props: {
  heading?: string;
  content?: any;
  label?: string;
  bgColor?: string;
  tip?: any;
  icon?: any;
  plain?: boolean;
  size?: "small" | "medium" | "large";
  onResult: (result: boolean) => boolean;
}) {
  const [show, setShow] = React.useState(false);
  const confirm = () => {
    if (props.onResult(true)) {
      setShow(false);
    }
  };

  const cancel = () => {
    if (props.onResult(true)) {
      setShow(false);
    }
  };
  return (
    <Box>
      <ActionButton
        icon={props.icon}
        onClick={() => setShow(true)}
        size={props.size || "small"}
        tip={props.tip || ""}
        bgColor={props.bgColor}
        plain={props.plain}
        style={{ padding: "12px" }}
      />
      {show && (
        <Layer
          onEsc={() => setShow(false)}
          onClickOutside={() => setShow(false)}
        >
          <Box>
            <Box
              align="center"
              justify="center"
              direction="row"
              background="bars"
              as="header"
              height="50px"
              round={{ corner: "top", size: "medium" }}
            >
              <Heading level={4} size="small">
                {props.heading || "Attention!"}
              </Heading>
            </Box>
            <Box
              align="center"
              pad="medium"
              direction="row"
              justify="center"
              background="brand"
            >
              {props.content || (
                <Paragraph>{"Are you sure you want to continue?"}</Paragraph>
              )}
            </Box>
            <Box
              align="center"
              as="footer"
              gap="small"
              height="50px"
              pad="medium"
              direction="row"
              justify="center"
              background="bars"
              round={{ corner: "bottom", size: "medium" }}
            >
              <Button
                icon={<FormClose />}
                label="No"
                color="status-error"
                focusIndicator={false}
                active={false}
                size="small"
                primary
                onClick={cancel}
              />
              <Button
                icon={<FormCheckmark />}
                color="status-ok"
                label="Yes"
                primary
                focusIndicator={false}
                active={false}
                size="small"
                onClick={confirm}
              />
            </Box>
          </Box>
        </Layer>
      )}
    </Box>
  );
}

export const StyledButton = styled(Button)<{
  borderRadius?: string;
  bgColor?: string;
  color?: string;
  opacity?: number;
  accentColor?: string;
  hoverScale?: number;
  hoverBgColor?: string;
}>`
  align-self: center;
  -webkit-backface-visibility: hidden;
  -webkit-transform: translateZ(0) scale(1, 1);
  transform: translateZ(0);
  font-smoothing: antialiased !important;
  background-color: ${(props) =>
    props.theme.global.colors[props.bgColor || "brand"]};
  border: 2px solid
    ${(props) => props.theme.global.colors[props.color || "light-6"]};
  border-radius: ${(props) => props.borderRadius || "6px"};
  color: ${(props) => props.theme.global.colors[props.color || "light-6"]};
  box-shadow: "none";
  opacity: ${(props) => props.opacity || 1};
  svg {
    fill: ${(props) => props.theme.global.colors[props.color || "light-6"]};
    stroke: ${(props) => props.theme.global.colors[props.color || "light-6"]};
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  &.dragging,
  &.selected,
  &:hover {
    -webkit-backface-visibility: hidden;
    -webkit-transform: translateZ(0) scale(1, 1);
    transform: translateZ(0);
    font-smoothing: antialiased !important;
    box-shadow: 0 0 4px 4px
      ${(props) => props.theme.global.colors[props.accentColor || "white"]} !important;
    border: 2px solid
      ${(props) => props.theme.global.colors[props.accentColor || "white"]};
    color: ${(props) =>
      props.theme.global.colors[props.accentColor || "white"]};
    opacity: 1;
    transform: scale(${(props) => props.hoverScale || 1}) translate3d(0, 0, 0);
    backface-visibility: hidden;
    transition: 0.3s;
    background-color: ${(props) =>
      props.theme.global.colors[
        props.hoverBgColor || props.bgColor || "brand"
      ]};
    svg {
      fill: ${(props) =>
        props.theme.global.colors[props.accentColor || "white"]};
      stroke: ${(props) =>
        props.theme.global.colors[props.accentColor || "white"]};
    }
  }
`;

interface IStyledBoxButtonProps {
  label?: string;
  borderRadius?: string;
  bgColor?: string;
  color?: string;
  opacity?: number;
  accentColor?: string;
  hoverScale?: number;
  fontSize?: string;
  hoverBgColor?: string;
}

export const StyledBox = styled(Box)<IStyledBoxButtonProps>`
  align-self: center;
  box-sizing: border-box;
  min-width: 120px;
  font-size: ${(props) => props.fontSize || "18px"};
  line-height: 24px;
  text-decoration: none !important;
  display: inline-block;
  -webkit-backface-visibility: hidden;
  -webkit-transform: translateZ(0) scale(1, 1);
  transform: translateZ(0);
  padding: 4px 22px !important;
  font-smoothing: antialiased !important;
  background-color: ${(props) =>
    props.theme.global.colors[props.bgColor || "brand"]};
  border: 2px solid
    ${(props) => props.theme.global.colors[props.bgColor || "brand"]};
  border-radius: ${(props) => props.borderRadius || "6px"};
  color: ${(props) => props.theme.global.colors[props.color || "light-6"]};
  box-shadow: "none";
  opacity: ${(props) => props.opacity || 1};
  svg {
    fill: ${(props) => props.theme.global.colors[props.color || "light-6"]};
    stroke: ${(props) => props.theme.global.colors[props.color || "light-6"]};
  }

  a {
    font-size: inherit;
    color: inherit;
    text-decoration: inherit;
  }

  &.dragging,
  &.selected,
  &:hover {
    -webkit-backface-visibility: hidden;
    -webkit-transform: translateZ(0) scale(1, 1);
    transform: translateZ(0);
    font-smoothing: antialiased !important;
    background-color: ${(props) =>
      props.theme.global.colors[
        props.hoverBgColor || props.bgColor || "brand"
      ]};
    box-shadow: 0 0 4px 4px
      ${(props) => props.theme.global.colors[props.accentColor || "white"]} !important;
    border: 2px solid
      ${(props) => props.theme.global.colors[props.accentColor || "white"]};
    color: ${(props) =>
      props.theme.global.colors[props.accentColor || "white"]};
    opacity: 1;
    transform: scale(${(props) => props.hoverScale || 1}) translate3d(0, 0, 0);
    backface-visibility: hidden;
    transition: 0.3s;
    svg {
      fill: ${(props) =>
        props.theme.global.colors[props.accentColor || "white"]};
      stroke: ${(props) =>
        props.theme.global.colors[props.accentColor || "white"]};
    }
  }
`;
