export interface SaveLayoutPayload {
  layoutData: {
    id: string;
    name: string;
  };
  widgetData: {
    id: string;
    // layout_id: string;
    props: {
      token?: string;
      period?: string;
      exchange_token?: string;
      sentiment_tab?: string;
    };
    meta: {
      i: string;
      x: number;
      y: number;
      w: number;
      h: number;
    };
  }[];
}
