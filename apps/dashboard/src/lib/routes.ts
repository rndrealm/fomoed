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
    // This is duplicated above, so I commented it out
    // forgotPassword: {
    //   name: "Forgot Password",
    //   path: "/auth/forgot-password",
    //   newPassword: {
    //     name: "New Password",
    //     path: "/auth/forgot-password/new-password",
    //   },
    // },
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
