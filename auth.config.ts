import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // only destructuring, not typing
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        if (isLoggedIn) return true; // allow access
        return false; // redirect to "/login"
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
        // logged in users attempting to access a public route will be redirected to /dashboard
      }
      return true; // the user is not logged in, but the page is public, so allow access.
    },
  },
  providers: [],
} satisfies NextAuthConfig;
