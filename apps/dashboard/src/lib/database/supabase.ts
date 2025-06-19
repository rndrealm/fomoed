export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      api_health: {
        Row: {
          created_at: string
          error_message: string
          health: string
          id: number
          response_time: number | null
          source: string
          status_code: number | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string
          health?: string
          id?: number
          response_time?: number | null
          source?: string
          status_code?: number | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string
          health?: string
          id?: number
          response_time?: number | null
          source?: string
          status_code?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cfgi_data: {
        Row: {
          created_at: string
          id: string
          today: Json | null
          token: string | null
          yesterday: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          today?: Json | null
          token?: string | null
          yesterday?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          today?: Json | null
          token?: string | null
          yesterday?: Json | null
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: number
          created_at: string
          user_id: string
        }
        Insert: {
          comment_id: number
          created_at?: string
          user_id: string
        }
        Update: {
          comment_id?: number
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          deleted: boolean
          id: number
          news_id: string
          parent_id: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted?: boolean
          id?: number
          news_id: string
          parent_id?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted?: boolean
          id?: number
          news_id?: string
          parent_id?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey2"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_user_data"
            referencedColumns: ["user_id"]
          },
        ]
      }
      custom_news: {
        Row: {
          author: string | null
          content: string | null
          created_at: string
          id: string
          summary: string | null
          title: string | null
          tokens: string[] | null
          user_id: string | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string
          id?: string
          summary?: string | null
          title?: string | null
          tokens?: string[] | null
          user_id?: string | null
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string
          id?: string
          summary?: string | null
          title?: string | null
          tokens?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_news_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      dashboard_settings: {
        Row: {
          active_tab_id: string | null
          auto_save: boolean | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          active_tab_id?: string | null
          auto_save?: boolean | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          active_tab_id?: string | null
          auto_save?: boolean | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      exchangeLiqMapCache: {
        Row: {
          asset: string
          created_at: string
          data: Json
          updated_at: string
        }
        Insert: {
          asset: string
          created_at?: string
          data: Json
          updated_at?: string
        }
        Update: {
          asset?: string
          created_at?: string
          data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      intake_answers: {
        Row: {
          created_at: string
          id: number
          intake_form_id: number
          intake_user_id: number
          question_id: number
          response: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          intake_form_id: number
          intake_user_id: number
          question_id: number
          response: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          intake_form_id?: number
          intake_user_id?: number
          question_id?: number
          response?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_answers_intake_form_id_intake_user_id_fkey"
            columns: ["intake_form_id", "intake_user_id"]
            isOneToOne: false
            referencedRelation: "intake_forms"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "intake_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "intake_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_forms: {
        Row: {
          contact_email: string
          created_at: string
          id: number
          updated_at: string | null
          user_id: number
        }
        Insert: {
          contact_email: string
          created_at?: string
          id?: number
          updated_at?: string | null
          user_id: number
        }
        Update: {
          contact_email?: string
          created_at?: string
          id?: number
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "intake_forms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_questions: {
        Row: {
          created_at: string | null
          id: number
          question_text: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          question_text: string
        }
        Update: {
          created_at?: string | null
          id?: number
          question_text?: string
        }
        Relationships: []
      }
      layouts: {
        Row: {
          created_at: string
          draft: boolean | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draft?: boolean | null
          id?: string
          name: string
          user_id?: string
        }
        Update: {
          created_at?: string
          draft?: boolean | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "layouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      news: {
        Row: {
          comments_count: number
          created_at: string
          id: string
          image_url: string | null
          likes_count: number
          metadata: Json | null
          original_url: string | null
          published_at: string | null
          sentiment: string | null
          source: string | null
          summary: string | null
          symbols: string[] | null
          title: string | null
        }
        Insert: {
          comments_count?: number
          created_at?: string
          id: string
          image_url?: string | null
          likes_count?: number
          metadata?: Json | null
          original_url?: string | null
          published_at?: string | null
          sentiment?: string | null
          source?: string | null
          summary?: string | null
          symbols?: string[] | null
          title?: string | null
        }
        Update: {
          comments_count?: number
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          metadata?: Json | null
          original_url?: string | null
          published_at?: string | null
          sentiment?: string | null
          source?: string | null
          summary?: string | null
          symbols?: string[] | null
          title?: string | null
        }
        Relationships: []
      }
      news_bookmarks: {
        Row: {
          created_at: string
          id: number
          news_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          news_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: number
          news_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_bookmarks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_bookmarks_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      news_likes: {
        Row: {
          created_at: string
          id: number
          news_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          news_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: number
          news_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_likes_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_likes_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          description: string
          id: string
          read: boolean | null
          smart_signal_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          read?: boolean | null
          smart_signal_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          read?: boolean | null
          smart_signal_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_smart_signal_id_fkey"
            columns: ["smart_signal_id"]
            isOneToOne: false
            referencedRelation: "firable_smart_signals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_smart_signal_id_fkey"
            columns: ["smart_signal_id"]
            isOneToOne: false
            referencedRelation: "smart_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      public_user_data: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sentiment: {
        Row: {
          device_id: string
          id: number
          sentiment: number
          timestamp: string
        }
        Insert: {
          device_id?: string
          id?: number
          sentiment: number
          timestamp: string
        }
        Update: {
          device_id?: string
          id?: number
          sentiment?: number
          timestamp?: string
        }
        Relationships: []
      }
      smart_signals: {
        Row: {
          actions: Json[] | null
          condition: string
          created_at: string
          description: string | null
          fired_at: string | null
          id: number
          name: string | null
          topics: string[]
          updated_at: string
          user_id: number
        }
        Insert: {
          actions?: Json[] | null
          condition: string
          created_at?: string
          description?: string | null
          fired_at?: string | null
          id?: number
          name?: string | null
          topics: string[]
          updated_at?: string
          user_id: number
        }
        Update: {
          actions?: Json[] | null
          condition?: string
          created_at?: string
          description?: string | null
          fired_at?: string | null
          id?: number
          name?: string | null
          topics?: string[]
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "smart_signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          end_timestamp: string | null
          has_cancelled: boolean
          id: number
          plan_name: string | null
          price_id: string | null
          start_timestamp: string | null
          subscription_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_timestamp?: string | null
          has_cancelled?: boolean
          id?: number
          plan_name?: string | null
          price_id?: string | null
          start_timestamp?: string | null
          subscription_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_timestamp?: string | null
          has_cancelled?: boolean
          id?: number
          plan_name?: string | null
          price_id?: string | null
          start_timestamp?: string | null
          subscription_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tabs: {
        Row: {
          created_at: string
          id: string
          layout_id: string | null
          name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          layout_id?: string | null
          name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          layout_id?: string | null
          name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tabs_layout_id_fkey"
            columns: ["layout_id"]
            isOneToOne: false
            referencedRelation: "layouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tabs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          has_had_free_trial: boolean
          id: number
          intake_program: boolean
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          has_had_free_trial?: boolean
          id?: number
          intake_program?: boolean
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          has_had_free_trial?: boolean
          id?: number
          intake_program?: boolean
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      widgets: {
        Row: {
          created_at: string
          id: string
          layout_id: string | null
          meta: Json | null
          props: Json | null
          token: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          layout_id?: string | null
          meta?: Json | null
          props?: Json | null
          token?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          layout_id?: string | null
          meta?: Json | null
          props?: Json | null
          token?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "widgets_layout_id_fkey"
            columns: ["layout_id"]
            isOneToOne: false
            referencedRelation: "layouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "widgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      firable_smart_signals: {
        Row: {
          actions: Json[] | null
          condition: string | null
          created_at: string | null
          description: string | null
          fired_at: string | null
          id: number | null
          name: string | null
          topics: string[] | null
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          actions?: Json[] | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          fired_at?: string | null
          id?: number | null
          name?: string | null
          topics?: string[] | null
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          actions?: Json[] | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          fired_at?: string | null
          id?: number | null
          name?: string | null
          topics?: string[] | null
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      fire_and_get_smart_signal: {
        Args: { p_id: number }
        Returns: {
          actions: Json[] | null
          condition: string
          created_at: string
          description: string | null
          fired_at: string | null
          id: number
          name: string | null
          topics: string[]
          updated_at: string
          user_id: number
        }
      }
      mark_notification_as_read: {
        Args: { notification_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
