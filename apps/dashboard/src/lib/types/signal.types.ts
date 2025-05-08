export interface ISignal {
  id: string;
  user_id: number;
  name: string;
  description: string;
  condition: string;
  topics: string[];
  actions: {
    email: boolean;
    notification: boolean;
  };
  created_at: string;
  updated_at: string;
}
