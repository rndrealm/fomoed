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

export interface GetAiSignalResponse {
  success: boolean;
  signal?: {
    name: string;
    description: string;
    condition: object;
  };
}
