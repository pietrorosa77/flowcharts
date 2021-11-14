import { IPosition, INode, IChart } from "./definitions";
import { Text, Markdown } from "grommet";
import * as AllIcons from "grommet-icons";

/// DRAG UTILS TO CALCULATE NODE POSITION
export function getPositionWithParentBoundsSize(
  canvasSize: { w: number; h: number },
  nodeSize: { w: number; h: number },
  multiSelectOffsets:
    | {
        offsetLeft: number;
        offsetRight: number;
        offsetTop: number;
        offsetBottom: number;
      }
    | undefined,
  x: number,
  y: number
): IPosition {
  const offsetLeft = multiSelectOffsets?.offsetLeft || 0;
  const offsetRight = multiSelectOffsets?.offsetRight || 0;
  const offsetTop = multiSelectOffsets?.offsetTop || 0;
  const offsetBottom = multiSelectOffsets?.offsetBottom || 0;

  const bounds = {
    left: 0 + offsetLeft,
    right: canvasSize.w - (nodeSize.w + offsetRight),
    top: 0 + offsetTop,
    bottom: canvasSize.h - (nodeSize.h + offsetBottom),
  };

  x = Math.min(x, bounds.right);
  y = Math.min(y, bounds.bottom);

  // But above left and top limits.
  x = Math.max(x, bounds.left);
  y = Math.max(y, bounds.top);

  return { x, y };
}

export const blockEvent = (e: any) => {
  e.preventDefault();
  e.stopPropagation();
};

export const getSimpleIcon = (
  icon?: string,
  size?: string,
  color?: string,
  placeholder?: string
) => {
  if (!icon) {
    return placeholder ? <Text>{placeholder}</Text> : null;
  }
  const Icon = (AllIcons as any)[icon];

  return <Icon size={size || "medium"} color={color} />;
};

export const GetIcon = (icon: string) =>
  icon ? (AllIcons as any)[icon] : undefined;

export const getInitialSchema = (): IChart => {
  return {
    nodes: {
      node1: {
        id: "node1",
        title: "Start!",
        content: `Welcome *your* user with a nice **message**!😂`,
        position: {
          x: 300,
          y: 100,
        },
        ports: {
          port1: {
            id: "port1",
            bgColor: "brand",
            text: "output",
            index: 1,
            properties: {},
          },
        },
        size: {
          h: 129,
          w: 250,
        },
      },
    },
    links: {},
    selected: {
      node1: false,
    },
    paths: {},
  };
};

export const getNodeRenderer = (
  node: INode,
  renderNode?: (node: INode) => JSX.Element
) => {
  if (!renderNode) {
    return <Markdown>{node.content}</Markdown>;
  }

  return renderNode(node);
};

export const getMultiselectionSquareRectOffsets = (scale: number) => {
  const elements = document.querySelectorAll(".drag-hat-selected");

  if (!elements.length) {
    return {};
  }

  const selectedRects = Array.from(elements).map((e) => ({
    rect: e.getBoundingClientRect(),
    id: e.id,
  }));

  if (!selectedRects || !selectedRects.length) {
    return {};
  }

  const minTop = Math.min(...selectedRects.map((r) => r.rect.top));
  const maxBottom = Math.max(...selectedRects.map((r) => r.rect.bottom));
  const minLeft = Math.min(...selectedRects.map((r) => r.rect.left));
  const maxRight = Math.max(...selectedRects.map((r) => r.rect.right));
  const selRect = {
    left: minLeft,
    top: minTop,
    bottom: maxBottom,
    right: maxRight,
  };

  const offsetsMap = selectedRects.reduce((acc, el) => {
    return {
      ...acc,
      [`${el.id}`]: {
        offsetLeft: Math.abs(el.rect.left - selRect.left) / scale,
        offsetRight: Math.abs(el.rect.right - selRect.right) / scale,
        offsetTop: Math.abs(el.rect.top - selRect.top) / scale,
        offsetBottom: Math.abs(el.rect.bottom - selRect.bottom) / scale,
      },
    };
  }, {});

  return offsetsMap;
};
