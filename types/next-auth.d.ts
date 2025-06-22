import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    error?: "RefreshTokenError";
    id_token?: string; // Add id_token to the session
  }
}
