import React, { createContext, useContext, ReactNode } from "react";
import {
  AppAuthContext,
  AppAuthProps,
  TypeAuthService,
} from "@type/provider/Auth";
import { ResponseHandler, TypeResponse } from "@type/common/Handler";
import useRoute from "@hooks/useNextRoute";
import useLocalStorage from "@hooks/useLocalStorage";
import AuthService from "@services/AuthService";
import qs from "qs";
import _ from "lodash";

const createQueryParams = (params: object): string => qs.stringify(params);

export const AuthContext = createContext<AppAuthContext>({
  authService: {
    loginWithEmailAndPassword: (opts: { email: string; password: string }) => {
      console.log("vào đây");
    },
    logout: () => null,
    isAuthenticated: () => false,
    generateRedirectUrl: (opts: {
      path: string;
      params: object;
      options?: object;
    }) => "",
    getRedirectUrl: () => "",
    onLoginRedirect: () => {},
  },
  user: null,
  currentUser: null,
});

const AuthProvider = ({ children, ...props }: AppAuthProps) => {
  const route = useRoute();
  const [user, $user] = React.useState(null);
  const checkAuth = () => {};
  const [currentUser, $currentUser] = useLocalStorage(
    "@store::currentUser",
    null
  );
  const [authToken, $authToken] = useLocalStorage("@store::authToken", null);
  const tokenUtil = {
    removeLocalStorage: () => {
      $user(null);
      $currentUser(null);
      $authToken("");
    },
    saveLocalStorage: (res: object) => {
      const token = _.get(res, "data.access_token");
      const user = _.get(res, "data.user", null);
      if (!_.isEmpty(user)) {
        $user(user);
        $currentUser(user);
      }
      if (!_.isEmpty(token)) {
        $authToken(token);
      }
    },
    updateToken: async () => {
      const res: TypeResponse = await AuthService.refreshToken();
      const handler: ResponseHandler = {
        success: tokenUtil.saveLocalStorage,
        fail: tokenUtil.removeLocalStorage,
      };
      const handlerName: string = _.get(res, "status") || "";
      if (
        !!handlerName &&
        _.isEmpty(handler[handlerName as keyof ResponseHandler])
      )
        handler[handlerName as keyof ResponseHandler](res);

      return res;
    },
  };
  const authService: TypeAuthService = {
    // TODO: Login authentication
    loginWithEmailAndPassword: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      // TODO: Login with username and password
      console.log("vào loginWithEmailAndPassword");
      const res: TypeResponse = await AuthService.loginWithEmailAndPassword({
        email,
        password,
      });
      console.log("res", res);
      const handler: ResponseHandler = {
        success: tokenUtil.saveLocalStorage,
        fail: tokenUtil.removeLocalStorage,
      };
      const handlerName = _.get(res, "status");
      if (!_.isEmpty(handlerName) && _.isFunction(handler[handlerName]))
        await handler[handlerName as keyof ResponseHandler](res);
      return res;
    },
    register: AuthService.register,
    verifyEmail: AuthService.verifyEmail,
    logout: async () => {
      await AuthService.logout();
      tokenUtil.removeLocalStorage();
    },
    isAuthenticated: () => {
      return !!currentUser;
    },
    generateRedirectUrl: ({
      path = "/",
      params,
      options,
    }: {
      path?: string;
      params?: object;
      options?: object;
    }): string => {
      const redirectUrl: string = route.redirectUrl(params, options);
      const redirectParams = { redirect_url: redirectUrl };
      return `${path}?${createQueryParams(redirectParams)}`;
    },
    getRedirectUrl: () => {
      const routeParams = useRoute.getParams();
      const redirectUrl = _.get(routeParams, "redirect_url", "/");
      return redirectUrl;
    },
    onLoginRedirect: () => {
      const routeParams = useRoute.getParams();
      const redirectUrl = _.get(routeParams, "redirect_url");
      if (redirectUrl) {
        try {
          const urlObj = new URL(redirectUrl);
          // urlObj.searchParams.set('__sync', 1);
          // route.navigateExternal(urlObj.toString());
        } catch (err) {
          console.log("redirect error", err);
        }
      } else {
        route.reload && route.reload();
      }
    },
  };
  React.useEffect(() => {
    (async () => {
      if (authToken) await tokenUtil.updateToken();
    })();
  }, []);
  // console.log({ authService });
  return (
    <AuthContext.Provider value={{ authService, currentUser, user }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuthContext = () => {
  return useContext(AuthContext);
};
export default AuthProvider;
