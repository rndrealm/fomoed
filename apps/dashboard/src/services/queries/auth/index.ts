import { useMutation } from "@tanstack/react-query";
import { LoginUserFunctionResponse, RegisterUserPayload } from "./types";
import { forgotPassword, loginUser, signUpNewUser } from "./mutationFunctions";
import { useRouter } from "next/navigation";
import { AppRoutes } from "@/lib/routes";
import { toast } from "sonner";

export const useRegisterUser = () => {
  const router = useRouter();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (
      body: RegisterUserPayload
    ): Promise<LoginUserFunctionResponse> => {
      return await signUpNewUser(body);
    },
    onSuccess: async (data) => {
      if (data.success) {
        router.push(AppRoutes.auth.mailAuthenticate.path);
      } else {
        toast(data.message || "Something went wrong!", {});
      }
    },
    onError: (data) => {
      toast(data.message || "Something went wrong!", {});
    },
  });
  return {
    mutate,
    isPending,
    isError,
  };
};

export const useLoginUser = () => {
  const router = useRouter();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (
      body: Omit<RegisterUserPayload, "username">
    ): Promise<LoginUserFunctionResponse> => {
      return await loginUser(body);
    },
    onSuccess: async (data) => {
      if (data.success) {
        router.push(AppRoutes.dashboard.path);
      } else {
        toast(data.message || "Something went wrong!", {});
      }
    },
    onError: (data) => {
      toast(data.message || "Something went wrong!", {});
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
    onSuccess: async (data) => {},
    onError: (data) => {
      toast(data.message || "Something went wrong!", {});
    },
  });
  return {
    mutate,
    isPending,
    isError,
  };
};
