/**
 * @deprecated use `Database['public']['Tables']['users']['Row']` instead
 */
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
