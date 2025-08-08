export interface SignalActions {
  email: boolean;
  notification: boolean;
}

/**
 * @deprecated Use supabase types
 */
export interface ISignal {
  id: string;
  user_id: number;
  name: string;
  description: string;
  condition: string;
  topics: string[];
  actions: SignalActions;
  created_at: string;
  updated_at: string;
}
