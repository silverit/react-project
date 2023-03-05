import { ReactNode } from "react";
import { TypeUserModel } from "@type/model/User";

export interface TypeAuthService {
  loginWithEmailAndPassword: (opts: { email: string; password: string }) => any;
  logout: () => any;
  isAuthenticated: () => boolean;
  generateRedirectUrl: (opts: {
    path: string;
    params: object;
    options?: object;
  }) => string;
  getRedirectUrl: () => string;
  onLoginRedirect: () => void;
  [key: string]: any;
}

export interface AppAuthContext {
  authService: TypeAuthService;
  user?: TypeUserModel | null;
  currentUser?: TypeUserModel | null;
}

export interface AppAuthProps {
  children: ReactNode;
  [key: string]: any;
}
