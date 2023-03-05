import _ from 'lodash';

const helper = {
    sleep: (ms: number) => new Promise((res) => setTimeout(res, ms)),
    isInternal: (to: string) => {
        return /^\/(?!\/)/.test(to);
    },
    normalizeObject: (obj: object) => {
        return _(obj)
            .omitBy(_.isUndefined)
            .omitBy((val) => val === '')
            .omitBy((val: []) => _.isArray(val) && val.length === 0)
            .value();
    },
    normalizeInventory: (inventories: any = []) => {
        return _.map(inventories, (item) =>
            helper.normalizeObject({
                id: _.get(item, 'id'),
                warehouse: _.get(item, 'warehouse.id') || _.get(item, 'warehouse'),
                quantity: _.get(item, 'quantity'),
            })
        );
    },
    flattenKeys: (obj = {}) => {
        const result: any = {};

        const flatten = (collection: object, prefix = '', suffix = '') => {
            _.forEach(collection, (value, key) => {
                const path = `${prefix}${key}${suffix}`;

                if (_.isArray(value)) {
                    flatten(value, `${path}[`, ']');
                } else if (_.isPlainObject(value)) {
                    flatten(value, `${path}.`);
                } else {
                    result[path] = value;
                }
            });
        };

        flatten(obj);

        return result;
    },
    replaceAll: (str: string = '', find: string, replace: string) => {
        if (!_.isString(str)) return '';
        return str.split(find).join(replace);
    },
    range: (start: number, end: number) => {
        const length = end - start + 1;
        return Array.from({ length }, (_, index) => index + start)
    }
};
export default helper;
