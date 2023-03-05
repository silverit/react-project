import config from '@utils/config';
import helper from '@utils/helper';
import _ from 'lodash';
import querystring from 'qs';
let cacheStore: any = {};
type TypeMapStatus = {
  200: string;
  204: string;
  [key: string | number]: any;
};
const MAP_STATUS: TypeMapStatus = {
  200: 'success',
  204: 'success',
};
const normalizeParams = (params: any, opts?: string[]) => {
  const page = _.get(params, 'page');
  const pageSize = _.get(params, 'pageSize');
  params = _.omit(params, ['page', 'pageSize']);
  let pagination = {};
  if (!_.isUndefined(page) && !_.isUndefined(pageSize)) {
    pagination = {
      page,
      pageSize,
    };
  }
  params = { ...params, pagination };
  if (!_.isEmpty(opts)) {
    params = _.pick(
      params,
      _.union(opts, ['pagination', 'sort', 'q', 'filter'])
    );
  }
  params = _(params)
    .omitBy(_.isUndefined)
    .omitBy((val) => val === '')
    .value();
  return params;
};

export const qs = {
  stringify: (url: string, params?: object): string => {
    if (_.isString(url)) {
      if (_.isEqual(_.last(url), '/')) url = url.slice(0, -1);
      params = normalizeParams(params);
      const query = querystring.stringify(
        _(params)
          .omitBy(_.isUndefined)
          .omitBy((val) => val === '')
          .value(),
        {
          encodeValuesOnly: true,
          skipNulls: true,
        }
      );
      return `${url}${query ? `?${query}` : ''}`;
    }
    return ``;
  },
};
class APIService {
  toUrlQuery(
    payload: { page?: any; pageSize?: any; [key: string]: any },
    opts?: []
  ) {
    const params = normalizeParams(payload, opts);
    const url = querystring.stringify({ params });
    return url;
  }
  config: any;
  constructor(config: any) {
    this.config = config;
  }
  updateConfig(config: any) {
    this.config = _.assign(this.config, { ...config });
    console.log('this config', this.config);
  }

  getToken() {
    if (typeof localStorage !== 'undefined') {
      return JSON.parse(localStorage.getItem('@store::authToken') || '""');
    }
  }
  getHeader(headers: any = {}) {
    const token = this.getToken();
    if (!!token) {
      headers.authorization = `Bearer ${token}`;
    }
    if (!_.isEmpty(_.get(this.config, 'organization_id'))) {
      headers['X-TSN-Company'] = this.config.organization_id;
    }
    return headers;
  }
  getEndpoint(url: string) {
    const internal = helper.isInternal(url);
    return internal ? `${_.get(this.config, 'baseUrl')}${url}` : url;
  }
  async get(
    url: string,
    { params = {}, headers, cache = false, ...config }: any = {}
  ) {
    try {
      const urlQuery = qs.stringify(url, params);
      let cacheKey = JSON.stringify({ url, urlQuery, method: 'GET' });
      if (cache && cacheStore[cacheKey]) {
        return cacheStore[cacheKey];
      }
      headers = this.getHeader(headers);
      const endpoint = this.getEndpoint(urlQuery);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
        credentials: 'include',
        ...config,
      });
      const result = await response.json();
      cacheStore[cacheKey] = result;
      return {
        status: MAP_STATUS[response.status] || 'fail',
        statusCode: response.status,
        ...result,
      };
    } catch (error) {
      console.log({ error });
      return {
        success: false,
        message:
          'Hệ thông đang có lỗi, rất xin lỗi bạn vì bất tiện này, vui lòng thử lại sau.',
        error,
      };
    }
  }
  async post(
    url: string,
    {
      data,
      body: bodyData,
      attach,
      headers,
      type = 'default',
      ...config
    }: any = {}
  ) {
    try {
      console.log({ url });
      const formData: any = new FormData();
      if (!_.isEmpty(data)) {
        _.forOwn(data, (value, key) => {
          formData.append(key, value);
        });
      }
      headers = this.getHeader({
        Accept: 'application/json',
        ...headers,
      });
      if (!_.isEmpty(bodyData)) {
        _.forOwn(bodyData, (value, key) => {
          formData.append(key, value);
        });
      }
      console.log({ attach });
      if (!_.isEmpty(attach)) {
        // Server need to support for field name 'images'.
        _.map(attach, (file) => {
          formData.append('images', file, file.name);
        });
      }

      const endpoint = this.getEndpoint(url);
      const handler: any = {
        form: async () => {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: formData,
            credentials: 'include',
            ...config,
          });

          const result = await response.json();
          return {
            status: MAP_STATUS[response.status] || 'fail',
            statusCode: response.status,
            ...result,
          };
        },
        default: async () => {
          headers = this.getHeader({
            'Content-Type': 'application/json',
            ...headers,
          });
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify({ ...bodyData }),
            ...config,
          });
          const result = await response.json();
          return {
            status: MAP_STATUS[response.status] || 'fail',
            statusCode: response.status,
            ...result,
          };
        },
      };
      return handler[type]();
    } catch (error) {
      console.log({ error });
      return {
        success: false,
        message:
          'Hệ thông đang có lỗi, rất xin lỗi bạn vì bất tiện này, vui lòng thử lại sau.',
        error,
      };
    }
  }
  async put(
    url: string,
    {
      data,
      body: bodyData,
      attach,
      headers,
      type = 'default',
      ...config
    }: any = {}
  ) {
    try {
      const formData = new FormData();
      if (!_.isEmpty(data)) {
        _.forOwn(data, (value, key) => {
          formData.append(key, value);
        });
      }
      headers = this.getHeader({
        Accept: 'application/json',
        ...headers,
      });
      const token = this.getToken();
      if (!!token) {
        headers.authorization = `Bearer ${token}`;
      }
      if (!_.isEmpty(bodyData)) {
        _.forOwn(bodyData, (value, key) => {
          formData.append(key, value);
        });
      }
      if (!_.isEmpty(attach)) {
        // Server need to support for field name 'images'.
        _.map(attach, (file) => {
          formData.append('image', file, file.name);
        });
      }
      const endpoint = this.getEndpoint(url);
      const handler: any = {
        form: async () => {
          const response = await fetch(endpoint, {
            method: 'PUT',
            headers: headers,
            body: formData,
            credentials: 'include',
            ...config,
          });
          const result = await response.json();
          return {
            status: MAP_STATUS[response.status] || 'fail',
            statusCode: response.status,
            ...result,
          };
        },
        default: async () => {
          headers = this.getHeader({
            'Content-Type': 'application/json',
            ...headers,
          });
          const response = await fetch(endpoint, {
            method: 'PUT',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify({ ...bodyData }),
            ...config,
          });
          const result = await response.json();
          return {
            status: MAP_STATUS[response.status] || 'fail',
            statusCode: response.status,
            ...result,
          };
        },
      };
      return handler[type]();
    } catch (error) {
      return {
        success: false,
        message:
          'Hệ thông đang có lỗi, rất xin lỗi bạn vì bất tiện này, vui lòng thử lại sau.',
        error,
      };
    }
  }
  async del(
    url: string,
    {
      data,
      body: bodyData,
      attach,
      headers,
      type = 'default',
      ...config
    }: any = {}
  ) {
    try {
      const formData = new FormData();
      if (!_.isEmpty(data)) {
        _.forOwn(data, (value, key) => {
          formData.append(key, value);
        });
      }
      headers = this.getHeader({
        Accept: 'application/json',
        ...headers,
      });
      const token = this.getToken();
      if (!!token) {
        headers.authorization = `Bearer ${token}`;
      }
      if (!_.isEmpty(bodyData)) {
        _.forOwn(bodyData, (value, key) => {
          formData.append(key, value);
        });
      }
      if (!_.isEmpty(attach)) {
        // Server need to support for field name 'images'.
        _.map(attach, (file) => {
          formData.append('image', file, file.name);
        });
      }
      const endpoint = this.getEndpoint(url);
      const handler: any = {
        form: async () => {
          const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: headers,
            body: formData,
            credentials: 'include',
            ...config,
          });
          const result = await response.json();
          return {
            status: MAP_STATUS[response.status] || 'fail',
            statusCode: response.status,
            ...result,
          };
        },
        default: async () => {
          headers = this.getHeader({
            'Content-Type': 'application/json',
            ...headers,
          });
          const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify({ ...bodyData }),
            ...config,
          });
          const result = await response.json();
          return {
            status: MAP_STATUS[response.status] || 'fail',
            statusCode: response.status,
            ...result,
          };
        },
      };
      return handler[type]();
    } catch (error) {
      return {
        success: false,
        message:
          'Hệ thông đang có lỗi, rất xin lỗi bạn vì bất tiện này, vui lòng thử lại sau.',
        error,
      };
    }
  }
}
const Model = new APIService({ baseUrl: config.API_DOMAIN });

export default Model;
