export const AppRoutes = {
  auth: {
    name: "Sign Up",
    path: "/auth",
    login: {
      name: "Login",
      path: "/auth/login",
    },
    forgotPassword: {
      name: "Forgot Password",
      path: "/auth/forgot-password",
      passwordMessage: {
        name: "Password Message",
        path: "/auth/forgot-password/password-message",
      },
      newPassword: {
        name: "New Password",
        path: "/auth/forgot-password/new-password",
      },
    },

    mailAuthenticate: {
      name: "Authenticate Mail",
      path: "/auth/mail-authenticate",
    },
  },
  dashboard: {
    name: "Dashboard",
    path: "/dashboard",
  },
  pricing: {
    name: "Pricing",
    path: "/pricing",
  },
};
