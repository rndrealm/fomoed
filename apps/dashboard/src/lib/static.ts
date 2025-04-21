import {
  FourGridPanes,
  FourHorizontalPanes,
  FourVerticalPanes,
  ILayoutSvgProps,
  SinglePane,
  ThreeHorizontalPanes,
  ThreeVerticalPanes,
  TwoHorizontalPanes,
  TwoVerticalPanes,
} from "@/components/icons/LayoutOptions";
import React from "react";

export const layoutClassMap = {
  SinglePane: "grid-rows-1 grid-cols-1",
  TwoVerticalPanes: "grid-rows-1 grid-cols-2",
  TwoHorizontalPanes: "grid-rows-2 grid-cols-1",
  ThreeVerticalPanes: "grid-rows-1 grid-cols-3",
  ThreeHorizontalPanes: "grid-rows-3 grid-cols-1",
  FourVerticalPanes: "grid-rows-1 grid-cols-4",
  FourHorizontalPanes: "grid-rows-4 grid-cols-1",
  FourGridPanes: "grid-rows-2 grid-cols-2",
};

export const layoutCountMap = {
  SinglePane: 1,
  TwoVerticalPanes: 2,
  TwoHorizontalPanes: 2,
  ThreeVerticalPanes: 3,
  ThreeHorizontalPanes: 3,
  FourVerticalPanes: 4,
  FourHorizontalPanes: 4,
  FourGridPanes: 4,
};

type LayoutName = keyof typeof layoutClassMap;

type LayoutOptions = {
  id: number;
  options: {
    id: number;
    svg: (props: ILayoutSvgProps) => React.JSX.Element;
    name: LayoutName;
  }[];
};

export const layoutOptions: LayoutOptions[] = [
  { id: 1, options: [{ id: 1, svg: SinglePane, name: "SinglePane" }] },

  {
    id: 2,
    options: [
      { id: 1, svg: TwoVerticalPanes, name: "TwoVerticalPanes" },
      { id: 2, svg: TwoHorizontalPanes, name: "TwoHorizontalPanes" },
    ],
  },

  {
    id: 3,
    options: [
      { id: 1, svg: ThreeVerticalPanes, name: "ThreeVerticalPanes" },
      { id: 2, svg: ThreeHorizontalPanes, name: "ThreeHorizontalPanes" },
    ],
  },

  {
    id: 4,
    options: [
      { id: 1, svg: FourVerticalPanes, name: "FourVerticalPanes" },
      { id: 2, svg: FourHorizontalPanes, name: "FourHorizontalPanes" },
      { id: 3, svg: FourGridPanes, name: "FourGridPanes" },
    ],
  },
];
