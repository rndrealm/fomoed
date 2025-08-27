export interface PublicUserDataRow {
  user_id: string;
  // Add other fields that exist in your database
  username?: string;
  display_name?: string;
  avatar_url?: string;
  created_at?: string;
  // Add any other fields from your public_user_data table
}

export interface UsersRow {
  avatar_url: string | null;
  created_at: string;
  email: string | null;
  has_had_free_trial: boolean;
  id: number;
  is_kol: boolean;
  is_project_manager: boolean;
  updated_at: string | null;
  user_id: string;
  username: string | null;
}
