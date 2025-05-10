export interface SignalActions {
  email: boolean;
  notification: boolean;
}

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

export interface CreateSignalDTO {
  name: string;
  description: string;
  condition: string;
  topics: string[];
  actions: object[];
  user_id: number; // FIXME: this is bad. backend should derive this from auth
}

export interface UpdateSignalDTO extends CreateSignalDTO {
  id: string;
}
