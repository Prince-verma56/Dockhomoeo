export interface ApiUser {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string;
  roles: string[];
}


export interface ApiAuthState {
  isAuthenticated: boolean;
  user: ApiUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
}

export interface ApiSession {
  token: string;
  expiresAt: string;
  user: ApiUser;
}

export interface ApiOtpRequest {
  phone: string;
}

export interface ApiOtpVerification {
  phone: string;
  code: string;
}

export interface ApiAuthResponse {
  success: boolean;
  message?: string;
  session?: ApiSession;
}
