export const AppRoutes = {
  auth: {
    name: "Sign Up",
    path: "/auth",
    login: {
      name: "Login",
      path: "/auth/login",
      withNext: (nextUrl?: string) => {
        if (!nextUrl) return "/auth/login";
        return `/auth/login?next=${encodeURIComponent(nextUrl)}`;
      },
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
  signals: {
    name: "Signals",
    path: "/signals",
    community: {
      marketplace: {
        name: "Marketplace",
        path: "/signals/community/marketplace",
      },
    },
  },
  pricing: {
    name: "Pricing",
    path: "/pricing",
  },
  logout: {
    name: "Logout",
    path: "/logout",
  },
  referrals: {
    name: "Referrals",
    path: "/referrals",
  },
  termsOfService: {
    name: "Terms of Service",
    path: "/terms-of-service",
  },
  // eventPhotos: {
  //   name: "Event Photos",
  //   path: "/event-photos",
  // },
  waitlist: {
    name: "Waitlist",
    path: "/waitlist",
    success: {
      name: "Waitlist Success",
      path: "/waitlist/success",
    },
  },
};
