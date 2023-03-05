import { useRouter, NextRouter } from "next/router";
import qs from "qs";
import routeStore from "@utils/routeStore";
import _ from "lodash";
// import { getCurrentLocaleConfig } from '@translations/util';
interface LocalRoute extends NextRouter {
  location: Location | null;
  navigateExternal: (url: string) => void;
  redirectUrl: (params: any, options: any) => string;
  pushStateParams: (params: any) => void;
  toUrl: (ruleName: string, value?: any) => string;
  breadcrumbs: (ruleName: string, value?: any) => any;
  push: (...prop: any) => any;
}
interface HookUseNextRoute {
  (): LocalRoute;
  getParams: () => object;
  mergeParams: (currParams?: any, params?: any) => any;
}
const mergeParams = (currParams: any, params: any) => {
  const rtn = _.merge(currParams, params);
  // unset
  _.map(params, (val, key) => {
    if (_.isUndefined(val)) {
      _.unset(rtn, key);
    }
  });
  return rtn;
};
const getWindow = () => {
  if (typeof window !== "undefined") return window;
  return {};
};
const getParams = (location: Location | object) => {
  const params = {
    ...qs.parse(`${_.get(location, "search") || ""}`.slice(1)),
    ...(() => {
      const state = _.get(location, "state", {});
      if (_.isPlainObject(state)) return state;
      return {};
    })(),
    ..._.get(getWindow(), "pageContext.params", {}),
  };
  return params;
};
const useLocalRoute = (): LocalRoute => {
  // push, back, reload,
  const hasLocation = typeof location !== "undefined";
  const router: NextRouter = useRouter();
  const result: LocalRoute = {
    ...router,
    redirectUrl: (params?: any, options?: any): string => {
      if (hasLocation) {
        const origin = _.get(options, "origin", true) ? location.origin : "";
        let { search, hash } = location;
        if (params) {
          const currParams = qs.parse(`${search}`.slice(1));
          const finalParams = mergeParams(currParams, params);
          search = `${qs.stringify(finalParams)}`;
          search = search ? `?${search}` : "";
        }
        return `${origin}${location.pathname}${search}${hash || ""}`;
      }
      return ``;
    },
    pushStateParams: (params) => {
      let { search, hash } = location;
      if (params) {
        search = `${qs.stringify(params)}`;
        search = search ? `?${search}` : "";
      }
      const url = `${location.pathname}${search}${hash || ""}`;
      if (typeof window !== "undefined") {
        window.history.pushState(`${search}`, "", url);
      }
    },
    // define default function
    location: typeof window !== "undefined" ? window.location : null,
    navigateExternal: (url: string): void => {
      if (typeof window !== "undefined") {
        window.location.href = url;
      }
    },
    toUrl: (ruleName: string, params?: object) => {
      if (typeof window !== "undefined" && !!ruleName) {
        const location = window.location;
        let url = routeStore.toUrl(ruleName, params);
        // const localeInstance = getCurrentLocaleConfig(location);
        // url = localeInstance.withLangPrefix(url);
        return url;
      }
      return "";
    },
    breadcrumbs: routeStore.breadcrumbs,
  };
  return result;
};
const useNextRoute: HookUseNextRoute = _.assign(useLocalRoute, {
  getParams: () => {
    const location: Location | object =
      typeof window === "undefined" ? {} : window.location;
    return getParams(location);
  },
  mergeParams,
});
export default useNextRoute;
