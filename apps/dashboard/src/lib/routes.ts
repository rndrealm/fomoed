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
      updatePassword: {
        name: "New Password",
        path: "/auth/forgot-password/update-password",
      },
    },
    authError: {
      name: "Auth Error",
      path: "/auth/auth-error",
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
  news: {
    name: "News",
    path: "/news",

    newsPage: {
      name: "Immersive News",
      path: (id: string) => `/news/${id}`,
    },
  },
  pricing: {
    name: "Pricing",
    path: "/pricing",
  },
};
