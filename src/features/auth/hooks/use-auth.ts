import { useAuthStore } from "../stores/auth-store";
import { authService } from "../services/auth-service";
import { toast } from "sonner";

export function useAuth() {
  const user = useAuthStore((state) => state.userInfo);
  const uid = useAuthStore((state) => state.uid);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const avatar = useAuthStore((state) => state.avatar);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const loginWithGoogle = async () => {
    try {
      await authService.signInWithGoogle();
      toast.success("Đăng nhập thành công!");
    } catch (err) {
      toast.error("Đăng nhập không thành công. Vui lòng đăng nhập lại!");
    }
  };

  const logoutUser = async () => {
    try {
      await authService.signOutUser();
      toast.success("Đăng xuất thành công!");
    } catch (err) {
      toast.error("Lỗi khi đăng xuất!");
    }
  };

  return {
    user,
    uid,
    isLoggedIn,
    avatar,
    isInitialized,
    loginWithGoogle,
    logoutUser,
  };
}
