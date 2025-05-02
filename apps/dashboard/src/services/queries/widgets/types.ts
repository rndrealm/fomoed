export interface SaveLayoutPayload {
  layoutData: {
    id: string;
    name: string;
    user_id: string;
  };
  widgetData: {
    id: string;
    // layout_id: string;
    user_id: string;
    token: string;
    meta: {
      i: string;
      x: number;
      y: number;
      w: number;
      h: number;
    };
  }[];
}
