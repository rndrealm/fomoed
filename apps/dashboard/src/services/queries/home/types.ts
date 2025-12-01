import { Json } from "@/lib/database/supabase";
import { UserGeoLocation } from "../geolocation/types";

export interface IDashboardData {
  tabs: {
    id: string;
    name: string;
    layout_id: string | null;
    layouts: {
      id: string;
      name: string;
      draft: boolean | null;
      widgets: {
        id: string;
        meta: Json;
        props: Json;
        layout_id: string | null;
      }[];
    } | null;
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
    auto_save: boolean | null;
    active_tab_id?: string | null;
    favorite_widgets: string[];
    favorite_tokens: string[];
    exchange?: string | null;
  };
  location?: UserGeoLocation;
}
