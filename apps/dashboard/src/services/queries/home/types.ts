export interface IDashboardData {
  tabs: {
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
  }[];
  layouts: {
    id: any;
    name: any;
    draft: any;
    widgets: {
      id: any;
      token: any;
      meta: any;
      props: any;
      layout_id: any;
    }[];
  }[];
  settings: {
    id: string;
    auto_save: boolean;
  };
}
