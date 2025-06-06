export interface SignalNotification {
  id: string;
  created_at: string;
  user_id: string;
  description: string;
  smart_signal_id: number;
  signal_name?: string;
}

