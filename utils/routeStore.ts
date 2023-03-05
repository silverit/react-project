import _ from "lodash";
interface TypeRouteStore {
  breadcrumbs: (ruleName: string, value?: any) => any;
  addRule: (ruleName: string, value: any) => void;
  toUrl: (ruleName: string, params?: object) => string;
  //   parseUrl: (slug: string) => any;
}
interface TypeGetRouteStore {
  (): TypeRouteStore;
}
const handler: any = {
  variant: (ruleName: string, params: object, breadcrumbs: []) => {
    const productId = _.get(params, "id");
    const variantId = _.get(params, "variantId");
    return `/product/${productId}/variant/${variantId}`;
  },
  variants: (ruleName: string, params: object, breadcrumbs: []) => {
    const productId = _.get(params, "id");
    return `/product/${productId}/variants`;
  },
  createVariant: (ruleName: string, params: object, breadcrumbs: []) => {
    const productId = _.get(params, "id");
    return `/product/${productId}/variant/create`;
  },
};
export const helper = {
  url: (ruleName: string, params?: any) => {
    if (_.has(handler, ruleName)) return handler[ruleName](ruleName, params);
    if (_.isEmpty(ruleName)) return "/";
    if (_.get(params, "id")) {
      return `/${ruleName}/${_.get(params, "id")}`;
    }
    return `/${ruleName}`;
  },
};
const getRouteStore: TypeGetRouteStore = () => {
  const store: { [key: string]: any } = {};
  const routeStore = {
    addRule: (ruleName: string, config: object) => {
      store[ruleName] = config;
      console.log(`add rule name:  ${ruleName}`);
    },
    toUrl: (ruleName: string, params?: object) => {
      const rule = _.get(store, ruleName);
      if (rule && _.isFunction(rule.url)) {
        return rule.url(params);
      }
      throw Error(`Rulename '${ruleName}' is not found`);
    },
    breadcrumbs: (ruleName: string, params?: object) => {
      const rule = _.get(store, ruleName);
      if (rule && _.isFunction(rule.breadcrumbs)) {
        return rule.breadcrumbs(params);
      }
      throw Error(`Breadcrumb '${ruleName}' is not found`);
    },
  };
  return routeStore;
};

export const routeStore = getRouteStore();

export default routeStore;
