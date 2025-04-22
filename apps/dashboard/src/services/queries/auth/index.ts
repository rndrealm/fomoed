import { useMutation } from "@tanstack/react-query";
import { RegisterUserPayload, SignUpResponse } from "./types";
import { forgotPassword, loginUser, signUpNewUser } from "./mutationFunctions";

export const useRegisterUser = () => {
  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (body: RegisterUserPayload): Promise<SignUpResponse> => {
      return await signUpNewUser(body);
    },
    onSuccess: async (data) => {
      console.log("response", data);
    },
    onError: (data) => {
      console.log("error:", data.message);
    },
  });
  return {
    mutate,
    isPending,
    isError,
  };
};

export const useLoginUser = () => {
  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (
      body: Omit<RegisterUserPayload, "username">
    ): Promise<{ email: string }> => {
      return await loginUser(body);
    },
    onSuccess: async (data) => {
      console.log("response", data);
    },
    onError: (data) => {
      console.log("error:", data.message);
    },
  });
  return {
    mutate,
    isPending,
    isError,
  };
};

export const useForgotPassword = () => {
  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (
      body: Omit<RegisterUserPayload, "username">
    ): Promise<{ email: string }> => {
      return await forgotPassword(body);
    },
    onSuccess: async (data) => {
      console.log("response", data);
    },
    onError: (data) => {
      console.log("error:", data.message);
    },
  });
  return {
    mutate,
    isPending,
    isError,
  };
};
