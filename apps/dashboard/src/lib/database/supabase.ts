export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
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
      campaign_kols: {
        Row: {
          assigned_at: string
          campaign_id: number
          kol_id: number
          request_meta: Json | null
          role: string | null
          status: Database["public"]["Enums"]["campaign_kol_status"]
        }
        Insert: {
          assigned_at?: string
          campaign_id: number
          kol_id: number
          request_meta?: Json | null
          role?: string | null
          status?: Database["public"]["Enums"]["campaign_kol_status"]
        }
        Update: {
          assigned_at?: string
          campaign_id?: number
          kol_id?: number
          request_meta?: Json | null
          role?: string | null
          status?: Database["public"]["Enums"]["campaign_kol_status"]
        }
        Relationships: [
          {
            foreignKeyName: "campaign_kols_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_with_meta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_kols_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_kols_kol_id_fkey"
            columns: ["kol_id"]
            isOneToOne: false
            referencedRelation: "kols"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_platforms: {
        Row: {
          campaign_id: number
          platform: string
        }
        Insert: {
          campaign_id: number
          platform: string
        }
        Update: {
          campaign_id?: number
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_platforms_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_with_meta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_platforms_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_tags: {
        Row: {
          campaign_id: number
          tag_id: number
        }
        Insert: {
          campaign_id: number
          tag_id: number
        }
        Update: {
          campaign_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_tags_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_with_meta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_tags_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          banner_url: string | null
          budget: number | null
          campaign_brief: string | null
          campaign_objectives: string[] | null
          campaign_type: string | null
          category: string | null
          content_types: string[] | null
          created_at: string
          description: string | null
          donts: string[]
          dos: string[]
          end_date: string | null
          external_links: Json | null
          faqs: Json | null
          id: number
          impressions: number | null
          instagram_handle: string | null
          location: string | null
          media_kit: string | null
          milestones: Json | null
          payment_mode: string | null
          platforms: string[] | null
          project_id: number
          reference_content: string | null
          requirements: Json | null
          resources: Json | null
          reward_type: string | null
          start_date: string | null
          status: string
          tags: string[] | null
          target_audience: string | null
          terms_and_conditions: string | null
          tiktok_handle: string | null
          title: string
          total_spend: number | null
          total_spots: number | null
          twitter_handle: string | null
          updated_at: string
          youtube_handle: string | null
        }
        Insert: {
          banner_url?: string | null
          budget?: number | null
          campaign_brief?: string | null
          campaign_objectives?: string[] | null
          campaign_type?: string | null
          category?: string | null
          content_types?: string[] | null
          created_at?: string
          description?: string | null
          donts?: string[]
          dos?: string[]
          end_date?: string | null
          external_links?: Json | null
          faqs?: Json | null
          id?: number
          impressions?: number | null
          instagram_handle?: string | null
          location?: string | null
          media_kit?: string | null
          milestones?: Json | null
          payment_mode?: string | null
          platforms?: string[] | null
          project_id: number
          reference_content?: string | null
          requirements?: Json | null
          resources?: Json | null
          reward_type?: string | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          target_audience?: string | null
          terms_and_conditions?: string | null
          tiktok_handle?: string | null
          title: string
          total_spend?: number | null
          total_spots?: number | null
          twitter_handle?: string | null
          updated_at?: string
          youtube_handle?: string | null
        }
        Update: {
          banner_url?: string | null
          budget?: number | null
          campaign_brief?: string | null
          campaign_objectives?: string[] | null
          campaign_type?: string | null
          category?: string | null
          content_types?: string[] | null
          created_at?: string
          description?: string | null
          donts?: string[]
          dos?: string[]
          end_date?: string | null
          external_links?: Json | null
          faqs?: Json | null
          id?: number
          impressions?: number | null
          instagram_handle?: string | null
          location?: string | null
          media_kit?: string | null
          milestones?: Json | null
          payment_mode?: string | null
          platforms?: string[] | null
          project_id?: number
          reference_content?: string | null
          requirements?: Json | null
          resources?: Json | null
          reward_type?: string | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          target_audience?: string | null
          terms_and_conditions?: string | null
          tiktok_handle?: string | null
          title?: string
          total_spend?: number | null
          total_spots?: number | null
          twitter_handle?: string | null
          updated_at?: string
          youtube_handle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      clipfarm_payable: {
        Row: {
          campaign_id: number
          created_at: string
          hits: number
          id: number
          maximum_payout_per_submission: number
          minimum_payout: number
          payout_id: number | null
          payout_per_1k_views: number
          updated_at: string
        }
        Insert: {
          campaign_id: number
          created_at?: string
          hits?: number
          id?: number
          maximum_payout_per_submission: number
          minimum_payout: number
          payout_id?: number | null
          payout_per_1k_views: number
          updated_at?: string
        }
        Update: {
          campaign_id?: number
          created_at?: string
          hits?: number
          id?: number
          maximum_payout_per_submission?: number
          minimum_payout?: number
          payout_id?: number | null
          payout_per_1k_views?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clipfarm_payable_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_with_meta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clipfarm_payable_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clipfarm_payable_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
          },
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
          favorite_tokens: string[]
          favorite_widgets: string[]
          id: string
          user_id: string | null
        }
        Insert: {
          active_tab_id?: string | null
          auto_save?: boolean | null
          created_at?: string
          favorite_tokens?: string[]
          favorite_widgets?: string[]
          id?: string
          user_id?: string | null
        }
        Update: {
          active_tab_id?: string | null
          auto_save?: boolean | null
          created_at?: string
          favorite_tokens?: string[]
          favorite_widgets?: string[]
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "dashboard_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      deliverables: {
        Row: {
          campaign_id: number
          created_at: string
          description: string | null
          hits: number
          id: number
          name: string
          payout_amount: number
          payout_id: number | null
          quota: number
          target_value: number
          type: string
          updated_at: string
        }
        Insert: {
          campaign_id: number
          created_at?: string
          description?: string | null
          hits?: number
          id?: number
          name: string
          payout_amount: number
          payout_id?: number | null
          quota: number
          target_value: number
          type: string
          updated_at?: string
        }
        Update: {
          campaign_id?: number
          created_at?: string
          description?: string | null
          hits?: number
          id?: number
          name?: string
          payout_amount?: number
          payout_id?: number | null
          quota?: number
          target_value?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_with_meta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
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
      feedback: {
        Row: {
          content: string | null
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
          user_id?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: []
      }
      gemach_session_key: {
        Row: {
          created_at: string
          id: number
          private_key: string
          public_key: string
          wallet: string
        }
        Insert: {
          created_at?: string
          id?: number
          private_key: string
          public_key: string
          wallet: string
        }
        Update: {
          created_at?: string
          id?: number
          private_key?: string
          public_key?: string
          wallet?: string
        }
        Relationships: []
      }
      in_app_notifications: {
        Row: {
          body: string
          created_at: string
          id: number
          meta: Json | null
          read_at: string | null
          status: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: number
          meta?: Json | null
          read_at?: string | null
          status?: string
          title: string
          type: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: number
          meta?: Json | null
          read_at?: string | null
          status?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "in_app_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "in_app_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      intake_forms: {
        Row: {
          biggest_campaign_success: string | null
          campaign_objectives: string | null
          chains_deployed: string | null
          community_members: number | null
          connected_wallets: number | null
          contact_email: string
          contacted_by_managment: boolean | null
          conversion_rate: number | null
          created_at: string
          email_address: string | null
          focus_kpis: string | null
          full_name: string | null
          id: number
          kols_activated: number | null
          listed_on_exchanges: string | null
          marketing_budget_spent: string | null
          project_description: string | null
          project_name: string | null
          project_type: string | null
          success_criteria: string | null
          token_address: string | null
          token_live: boolean | null
          token_url: string | null
          twitter_followers: number | null
          twitter_handle: string | null
          updated_at: string | null
          user_id: string
          website_url: string | null
          who_are_you: string | null
        }
        Insert: {
          biggest_campaign_success?: string | null
          campaign_objectives?: string | null
          chains_deployed?: string | null
          community_members?: number | null
          connected_wallets?: number | null
          contact_email: string
          contacted_by_managment?: boolean | null
          conversion_rate?: number | null
          created_at?: string
          email_address?: string | null
          focus_kpis?: string | null
          full_name?: string | null
          id?: number
          kols_activated?: number | null
          listed_on_exchanges?: string | null
          marketing_budget_spent?: string | null
          project_description?: string | null
          project_name?: string | null
          project_type?: string | null
          success_criteria?: string | null
          token_address?: string | null
          token_live?: boolean | null
          token_url?: string | null
          twitter_followers?: number | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
          who_are_you?: string | null
        }
        Update: {
          biggest_campaign_success?: string | null
          campaign_objectives?: string | null
          chains_deployed?: string | null
          community_members?: number | null
          connected_wallets?: number | null
          contact_email?: string
          contacted_by_managment?: boolean | null
          conversion_rate?: number | null
          created_at?: string
          email_address?: string | null
          focus_kpis?: string | null
          full_name?: string | null
          id?: number
          kols_activated?: number | null
          listed_on_exchanges?: string | null
          marketing_budget_spent?: string | null
          project_description?: string | null
          project_name?: string | null
          project_type?: string | null
          success_criteria?: string | null
          token_address?: string | null
          token_live?: boolean | null
          token_url?: string | null
          twitter_followers?: number | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
          who_are_you?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_forms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "intake_forms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      kol_clipfarm_payable: {
        Row: {
          campaign_id: number
          clipfarm_payable_id: number
          completed_on: string | null
          created_at: string
          earned_amount: number
          id: number
          kol_id: number
          post_id: number | null
          updated_at: string
          views: number
        }
        Insert: {
          campaign_id: number
          clipfarm_payable_id: number
          completed_on?: string | null
          created_at?: string
          earned_amount?: number
          id?: number
          kol_id: number
          post_id?: number | null
          updated_at?: string
          views?: number
        }
        Update: {
          campaign_id?: number
          clipfarm_payable_id?: number
          completed_on?: string | null
          created_at?: string
          earned_amount?: number
          id?: number
          kol_id?: number
          post_id?: number | null
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "kol_clipfarm_payable_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_with_meta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kol_clipfarm_payable_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kol_clipfarm_payable_clipfarm_payable_id_fkey"
            columns: ["clipfarm_payable_id"]
            isOneToOne: false
            referencedRelation: "clipfarm_payable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kol_clipfarm_payable_kol_id_fkey"
            columns: ["kol_id"]
            isOneToOne: false
            referencedRelation: "kols"
            referencedColumns: ["id"]
          },
        ]
      }
      kol_deliverables: {
        Row: {
          campaign_id: number
          completed_on: string | null
          created_at: string
          deliverable_id: number
          hits: number
          id: number
          kol_id: number
          updated_at: string
        }
        Insert: {
          campaign_id: number
          completed_on?: string | null
          created_at?: string
          deliverable_id: number
          hits?: number
          id?: number
          kol_id: number
          updated_at?: string
        }
        Update: {
          campaign_id?: number
          completed_on?: string | null
          created_at?: string
          deliverable_id?: number
          hits?: number
          id?: number
          kol_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kol_deliverables_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_with_meta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kol_deliverables_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kol_deliverables_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kol_deliverables_kol_id_fkey"
            columns: ["kol_id"]
            isOneToOne: false
            referencedRelation: "kols"
            referencedColumns: ["id"]
          },
        ]
      }
      kol_milestones: {
        Row: {
          campaign_id: number
          completed_on: string | null
          hits: number
          id: number
          kol_id: number
          milestone_id: number
        }
        Insert: {
          campaign_id: number
          completed_on?: string | null
          hits?: number
          id?: number
          kol_id: number
          milestone_id: number
        }
        Update: {
          campaign_id?: number
          completed_on?: string | null
          hits?: number
          id?: number
          kol_id?: number
          milestone_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "kol_milestones_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_with_meta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kol_milestones_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kol_milestones_kol_id_fkey"
            columns: ["kol_id"]
            isOneToOne: false
            referencedRelation: "kols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kol_milestones_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      kol_platforms: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: number
          kol_id: number
          platform: string
          refresh_token: string
          scope: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: number
          kol_id: number
          platform: string
          refresh_token: string
          scope?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: number
          kol_id?: number
          platform?: string
          refresh_token?: string
          scope?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kol_platforms_kol_id_fkey"
            columns: ["kol_id"]
            isOneToOne: false
            referencedRelation: "kols"
            referencedColumns: ["id"]
          },
        ]
      }
      kol_requests: {
        Row: {
          campaign_id: number
          content_link: string | null
          created_at: string
          id: number
          interest: string | null
          kol_id: number
          location: string | null
          message: string | null
          payment_amount: number
          platforms_array: string[] | null
        }
        Insert: {
          campaign_id: number
          content_link?: string | null
          created_at?: string
          id?: number
          interest?: string | null
          kol_id: number
          location?: string | null
          message?: string | null
          payment_amount: number
          platforms_array?: string[] | null
        }
        Update: {
          campaign_id?: number
          content_link?: string | null
          created_at?: string
          id?: number
          interest?: string | null
          kol_id?: number
          location?: string | null
          message?: string | null
          payment_amount?: number
          platforms_array?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "kol_requests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_with_meta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kol_requests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kol_requests_kol_id_fkey"
            columns: ["kol_id"]
            isOneToOne: false
            referencedRelation: "kols"
            referencedColumns: ["id"]
          },
        ]
      }
      kols: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          content_types: string | null
          created_at: string
          email: string
          expertise: string | null
          full_name: string
          id: number
          location: string | null
          onboarding: boolean | null
          profile_url: string | null
          twitter_handle: string | null
          updated_at: string
          user_id: string | null
          wallet_address: string | null
          wallet_chain: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          content_types?: string | null
          created_at?: string
          email: string
          expertise?: string | null
          full_name: string
          id?: number
          location?: string | null
          onboarding?: boolean | null
          profile_url?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string | null
          wallet_address?: string | null
          wallet_chain?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          content_types?: string | null
          created_at?: string
          email?: string
          expertise?: string | null
          full_name?: string
          id?: number
          location?: string | null
          onboarding?: boolean | null
          profile_url?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string | null
          wallet_address?: string | null
          wallet_chain?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kols_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "kols_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
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
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "layouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      milestones: {
        Row: {
          campaign_id: number
          created_at: string
          deadline: string | null
          description: string | null
          hits: number
          id: number
          payout_amount: number
          payout_id: number | null
          quota: number
          status: string
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          campaign_id: number
          created_at?: string
          deadline?: string | null
          description?: string | null
          hits?: number
          id?: number
          payout_amount: number
          payout_id?: number | null
          quota?: number
          status?: string
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: number
          created_at?: string
          deadline?: string | null
          description?: string | null
          hits?: number
          id?: number
          payout_amount?: number
          payout_id?: number | null
          quota?: number
          status?: string
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_with_meta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          ai_summary: string[] | null
          comments_count: number
          created_at: string
          id: string
          image_url: string | null
          likes_count: number
          metadata: Json | null
          original_url: string | null
          published_at: string | null
          related_widgets: Json[] | null
          sentiment: string | null
          slug: string | null
          source: string | null
          summary: string | null
          symbols: string[] | null
          title: string | null
        }
        Insert: {
          ai_summary?: string[] | null
          comments_count?: number
          created_at?: string
          id: string
          image_url?: string | null
          likes_count?: number
          metadata?: Json | null
          original_url?: string | null
          published_at?: string | null
          related_widgets?: Json[] | null
          sentiment?: string | null
          slug?: string | null
          source?: string | null
          summary?: string | null
          symbols?: string[] | null
          title?: string | null
        }
        Update: {
          ai_summary?: string[] | null
          comments_count?: number
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          metadata?: Json | null
          original_url?: string | null
          published_at?: string | null
          related_widgets?: Json[] | null
          sentiment?: string | null
          slug?: string | null
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
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
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
      news_favorites: {
        Row: {
          created_at: string
          id: number
          news_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          news_id?: string
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
            foreignKeyName: "news_favorites_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "news_favorites_user_id_fkey"
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
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
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
            referencedRelation: "signals_users"
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
      payout_audit_log: {
        Row: {
          action: string
          created_at: string
          id: number
          new_status: string | null
          notes: string | null
          old_status: string | null
          payout_id: number
          performed_by: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: number
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          payout_id: number
          performed_by: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: number
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          payout_id?: number
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_audit_log_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payout_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          campaign_id: number
          chain: string
          created_at: string
          id: number
          kol_clipfarm_payable_id: number | null
          kol_id: number
          milestone_id: number | null
          notes: string | null
          paid_at: string | null
          rejection_reason: string | null
          status: string
          tx_id: string | null
          updated_at: string
          wallet_address: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          campaign_id: number
          chain?: string
          created_at?: string
          id?: number
          kol_clipfarm_payable_id?: number | null
          kol_id: number
          milestone_id?: number | null
          notes?: string | null
          paid_at?: string | null
          rejection_reason?: string | null
          status?: string
          tx_id?: string | null
          updated_at?: string
          wallet_address: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          campaign_id?: number
          chain?: string
          created_at?: string
          id?: number
          kol_clipfarm_payable_id?: number | null
          kol_id?: number
          milestone_id?: number | null
          notes?: string | null
          paid_at?: string | null
          rejection_reason?: string | null
          status?: string
          tx_id?: string | null
          updated_at?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payouts_milestone"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payouts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payouts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_with_meta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_kol_clipfarm_payable_id_fkey"
            columns: ["kol_clipfarm_payable_id"]
            isOneToOne: true
            referencedRelation: "kol_clipfarm_payable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_kol_id_fkey"
            columns: ["kol_id"]
            isOneToOne: false
            referencedRelation: "kols"
            referencedColumns: ["id"]
          },
        ]
      }
      post_submissions: {
        Row: {
          campaign_id: number
          created_at: string | null
          end_date: string
          engagement: number | null
          handle: string
          id: number
          impressions: number | null
          kol: number
          last_update: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          post_id: string
          raw_post: Json | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_on: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: number
          created_at?: string | null
          end_date: string
          engagement?: number | null
          handle: string
          id?: number
          impressions?: number | null
          kol: number
          last_update?: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          post_id: string
          raw_post?: Json | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_on?: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: number
          created_at?: string | null
          end_date?: string
          engagement?: number | null
          handle?: string
          id?: number
          impressions?: number | null
          kol?: number
          last_update?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          post_id?: string
          raw_post?: Json | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_on?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_submissions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_with_meta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_submissions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_submissions_kol_fkey"
            columns: ["kol"]
            isOneToOne: false
            referencedRelation: "kols"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          project_id: number
          role: string
          user_id: string
        }
        Insert: {
          project_id: number
          role: string
          user_id: string
        }
        Update: {
          project_id?: number
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      projects: {
        Row: {
          banner_url: string | null
          budget: number | null
          category: string | null
          connected_platforms: string[] | null
          created_at: string
          description: string | null
          end_date: string | null
          exchange_listings: Json
          id: number
          instagram_handle: string | null
          name: string
          objectives: string[]
          social_links: Json | null
          start_date: string | null
          status: string
          tiktok_handle: string | null
          token_address: string | null
          token_chain: string | null
          twitter_handle: string | null
          updated_at: string
          website: string | null
          youtube_handle: string | null
        }
        Insert: {
          banner_url?: string | null
          budget?: number | null
          category?: string | null
          connected_platforms?: string[] | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          exchange_listings?: Json
          id?: number
          instagram_handle?: string | null
          name: string
          objectives?: string[]
          social_links?: Json | null
          start_date?: string | null
          status?: string
          tiktok_handle?: string | null
          token_address?: string | null
          token_chain?: string | null
          twitter_handle?: string | null
          updated_at?: string
          website?: string | null
          youtube_handle?: string | null
        }
        Update: {
          banner_url?: string | null
          budget?: number | null
          category?: string | null
          connected_platforms?: string[] | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          exchange_listings?: Json
          id?: number
          instagram_handle?: string | null
          name?: string
          objectives?: string[]
          social_links?: Json | null
          start_date?: string | null
          status?: string
          tiktok_handle?: string | null
          token_address?: string | null
          token_chain?: string | null
          twitter_handle?: string | null
          updated_at?: string
          website?: string | null
          youtube_handle?: string | null
        }
        Relationships: []
      }
      referral_commissions: {
        Row: {
          amount: number | null
          created_at: string
          id: number
          payment_link: string | null
          payout_date: string | null
          referral_id: string
          status: string
          stripe_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: number
          payment_link?: string | null
          payout_date?: string | null
          referral_id: string
          status?: string
          stripe_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: number
          payment_link?: string | null
          payout_date?: string | null
          referral_id?: string
          status?: string
          stripe_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["referral_id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: number
          referral_id: string
          referred_user_id: string | null
          referrer_user_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          referral_id: string
          referred_user_id?: string | null
          referrer_user_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          referral_id?: string
          referred_user_id?: string | null
          referrer_user_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
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
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
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
      tags: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role: string
          user_id: string
        }
        Insert: {
          role: string
          user_id: string
        }
        Update: {
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          has_had_free_trial: boolean
          id: number
          is_kol: boolean
          is_kol_allowed: boolean
          is_marketing_allowed: boolean
          is_project_manager: boolean
          last_name: string | null
          onboarded: boolean | null
          referral_code: string | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          has_had_free_trial?: boolean
          id?: number
          is_kol?: boolean
          is_kol_allowed?: boolean
          is_marketing_allowed?: boolean
          is_project_manager?: boolean
          last_name?: string | null
          onboarded?: boolean | null
          referral_code?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          has_had_free_trial?: boolean
          id?: number
          is_kol?: boolean
          is_kol_allowed?: boolean
          is_marketing_allowed?: boolean
          is_project_manager?: boolean
          last_name?: string | null
          onboarded?: boolean | null
          referral_code?: string | null
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
            referencedRelation: "signals_users"
            referencedColumns: ["user_id"]
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
      campaign_with_meta: {
        Row: {
          active_count: number | null
          active_milestones: number | null
          banner_url: string | null
          budget: number | null
          campaign_brief: string | null
          campaign_type: string | null
          category: string | null
          completed_milestones: number | null
          content_types: string[] | null
          created_at: string | null
          description: string | null
          end_date: string | null
          external_links: Json | null
          faqs: Json | null
          id: number | null
          impressions: number | null
          instagram_handle: string | null
          location: string | null
          max_payout: number | null
          media_kit: string | null
          milestone_count: number | null
          milestones: Json | null
          paid_payouts: number | null
          pending_payout_amount: number | null
          pending_payouts: number | null
          platform_list: string[] | null
          platforms: string[] | null
          project_id: number | null
          reference_content: string | null
          request_count: number | null
          requirements: Json | null
          resources: Json | null
          reward_type: string | null
          start_date: string | null
          status: string | null
          tag_list: string[] | null
          tags: string[] | null
          target_audience: string | null
          terms_and_conditions: string | null
          tiktok_handle: string | null
          title: string | null
          total_paid_amount: number | null
          total_payouts: number | null
          total_spend: number | null
          total_spots: number | null
          twitter_handle: string | null
          updated_at: string | null
          youtube_handle: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
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
      signals_users: {
        Row: {
          condition: string | null
          fired_at: string | null
          id: number | null
          topics: string[] | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
      youtube_streaming_topics: {
        Row: {
          topic: string | null
        }
        Relationships: []
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
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      mark_notification_as_read: {
        Args: { notification_id: string }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      campaign_kol_status: "pending" | "active" | "banned" | "rejected"
      platform_type: "twitter" | "tiktok" | "instagram" | "youtube"
      submission_status:
        | "pending"
        | "approved"
        | "rejected"
        | "flagged"
        | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      campaign_kol_status: ["pending", "active", "banned", "rejected"],
      platform_type: ["twitter", "tiktok", "instagram", "youtube"],
      submission_status: [
        "pending",
        "approved",
        "rejected",
        "flagged",
        "completed",
      ],
    },
  },
} as const
