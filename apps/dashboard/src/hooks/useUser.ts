import { useAtomValue } from "jotai";
import { authUserAtom, isLoadingUserAtom, publicUserDataAtom } from "@/lib/atoms/userAtom";

export function useUser() {
  const authUser = useAtomValue(authUserAtom);
  const publicUserData = useAtomValue(publicUserDataAtom);
  const isLoading = useAtomValue(isLoadingUserAtom);
  
  return {
    user: authUser,
    userData: publicUserData,
    isLoading,
    isAuthenticated: !!authUser,
  };
}