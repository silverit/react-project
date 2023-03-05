import React from 'react';
import _ from 'lodash';
const useLocalStorage = (key: string, defVal: any) => {
  const isCSR = typeof localStorage !== 'undefined';
  const [value, $value] = React.useState(() => {
    let itemVal = defVal;
    try {
      if (isCSR) {
        const str = localStorage.getItem(key) || '""';
        const parsed = JSON.parse(str);
        itemVal = parsed === null ? defVal : parsed;
        itemVal = _.isFunction(itemVal) ? itemVal() : itemVal;
      }
    } catch (err) {
      console.log({ '@useLocalStorage:': err });
    }
    return itemVal;
  });
  const setValue = (newVal: any) => {
    try {
      if (isCSR) {
        localStorage.setItem(key, JSON.stringify(newVal));
        $value(newVal);
      }
    } catch (err) {
      console.log({ '@useLocalStorage:': err });
    }
  };
  return [value, setValue];
};
export default useLocalStorage;
