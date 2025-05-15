export type GetTabsResponse = Array<{
  id: any;
  name: any;
  layout_id: any;
  layouts: {
    id: any;
    name: any;
    draft: any;
    widgets: {
      id: any;
      meta: any;
      props: any;
      layout_id: any;
    }[];
  }[];
}>;

export interface AddTabPayload {
  id: string;
  name: string;
}

export type SyncTabsPayload = Array<{
  id: string;
  name: string;
  layout_id?: string | null;
}>;
