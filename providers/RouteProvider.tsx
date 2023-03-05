import React, { createContext, useContext, ReactNode } from 'react';
import {
  AppRouteContext,
  AppRouteProps,
  TypeRoutesContext,
} from '@type/provider/Route';
import useRoute from '@hooks/useNextRoute';
import routeStore, { helper } from '@utils/routeStore';
// import i18n from '@translations/i18n';
import _ from 'lodash';
export const RouteContext = createContext<AppRouteContext>({
  router: {
    push: () => {},
  },
});

interface TypeUseRouteContext {
  (): AppRouteContext;
}
// create rule for every routing;
routeStore.addRule('sign-in', {
  url: (params?: object) => {
    return helper.url('sign-in');
  },
});
routeStore.addRule('sign-up', {
  url: (params?: object) => {
    return helper.url('sign-up');
  },
});
routeStore.addRule('verifyEmail', {
  url: (params?: object) => {
    return helper.url('verifyEmail');
  },
});
routeStore.addRule('verifyEmailId', {
  url: (params?: object) => {
    return helper.url('verifyEmail', params);
  },
});

const RouteProvider = ({ children, ...props }: AppRouteProps): ReactNode => {
  // define all route's method to use;
  const nextRouter = useRoute();
  const router: TypeRoutesContext = {
    ...nextRouter,
    push: (path: string, params?: object) => {
      path = _.first(path) === '/' ? `${path}`.slice(1) : `${path}`;
      const baseUrl = nextRouter.toUrl(path, params);
      if (!!baseUrl) {
        nextRouter.push(baseUrl, null, { shallow: true });
      }
    },
  };
  return (
    <RouteContext.Provider value={{ router }}>{children}</RouteContext.Provider>
  );
};
export const useRouteContext: TypeUseRouteContext = () => {
  return useContext(RouteContext);
};
export default RouteProvider;
