// Interfaces específicas para Better Auth
export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture: string;
  email_verified: boolean;
}

export interface AuthAccount {
  provider: string;
  providerAccountId: string;
  type: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export interface AuthSession {
  user: import("./user").User;
}

export interface AuthToken {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  iat?: number;
  exp?: number;
}
