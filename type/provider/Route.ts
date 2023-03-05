import { ReactNode } from "react";

export interface TypeRoutesContext {
  login?: () => void;
  users?: () => void;
  user?: (params: object) => void;
  inventory?: (params: object) => void;
  inventoryReconciliation?: (params: object) => void;
  ___storyboard?: () => void;
  push: (path: string, params?: object) => void;
  [key: string]: any;
}

export interface AppRouteContext {
  router: TypeRoutesContext;
}
export interface AppRouteProps {
  children: ReactNode;
  [key: string]: any;
}
