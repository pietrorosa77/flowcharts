import { Box, Button } from "grommet";
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
