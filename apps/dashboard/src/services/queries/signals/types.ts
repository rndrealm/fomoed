export interface CreateSignalDTO {
  name: string;
  description: string;
  condition: string;
  actions: Array<{
    type: string;
    subject?: string;
    content?: string;
    description?: string;
  }>;
  user_id: number; // FIXME: this is bad. backend should derive this from auth
}

export interface UpdateSignalDTO extends CreateSignalDTO {
  id: number;
}

type GenSignalError = "cannot-generate";

export interface GetAiSignalResponseBody {
  success: boolean;
  signal?: {
    name: string;
    description: string;
    condition: object;
  };
  message?: string;
  feedbackId?: number;
  error?: GenSignalError;
}
