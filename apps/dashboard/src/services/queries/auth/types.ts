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
