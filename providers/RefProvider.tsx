import React, { createContext, useContext, ReactNode } from 'react';
import { AppRefContext, TypeRef } from '@type/provider/Ref';
import useRoute from '@hooks/useNextRoute';
import _ from 'lodash';
export const RefContext = createContext<AppRefContext>({
  REF: {
    setRef: (key, value) => {},
    getRef: (key) => {
      return {};
    },
  },
});

interface TypeUseRefContext {
  (): AppRefContext;
}

const RefProvider = ({ children, ...props }: AppRefContext): ReactNode => {
  const ref = React.useRef({ data: {} });
  const REF: TypeRef = {
    setRef: (key: string, value: any) => {
      _.set(ref.current.data, key, value);
    },
    getRef: (key: string) => {
      return _.get(ref.current.data, key);
    },
  };
  return <RefContext.Provider value={{ REF }}>{children}</RefContext.Provider>;
};
export const useRefContext: TypeUseRefContext = () => {
  return useContext(RefContext) || {};
};
export default RefProvider;
