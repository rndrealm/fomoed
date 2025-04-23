export interface RegisterUserPayload {
  email: string;
  password: string;
  username: string;
}

export interface CreateUserRowPayload {
  email: string;
  username: string;
  user_id: string;
}

export type SignUpResponse = {
  userId: string;
  email: string;
};

export type SuperbaseFunctionsBaseType = {
  success: boolean;
  message: string;
};

export interface LoginUserFunctionResponse extends SuperbaseFunctionsBaseType {
  email?: string;
}
