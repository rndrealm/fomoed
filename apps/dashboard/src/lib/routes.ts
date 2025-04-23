export const AppRoutes = {
  auth: {
    name: "Sign Up",
    path: "/auth",
    login: {
      name: "Login",
      path: "/auth/login",
    },
    mailAuthenticate: {
      name: "Authenticate Mail",
      path: "/auth/mail-authenticate",
    },
    forgotPassword: {
      name: "Forgot Password",
      path: "/auth/forgot-password",
      newPassword: {
        name: "New Password",
        path: "/auth/forgot-password/new-password",
      },
    },
  },
  dashboard: {
    name: "Dashboard",
    path: "/dashboard",
  },
};
