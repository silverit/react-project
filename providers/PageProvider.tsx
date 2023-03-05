import React, { createContext, useContext, ReactNode } from 'react';
import { AppPageContext, AppPageProps } from '@type/provider/Page';
import _ from 'lodash';
export const PageContext = createContext<AppPageContext>({
  isSSR: false,
});

interface TypeUsePageContext {
  (): AppPageContext;
}

const PageProvider = ({
  children,
  pageContext,
  ...props
}: AppPageProps): ReactNode => {
  const [isSSR, $isSSR] = React.useState(true);
  // const isSSR = typeof window === "undefined";
  React.useEffect(() => {
    $isSSR(false);
  }, []);
  return (
    <PageContext.Provider value={{ isSSR, ...pageContext }}>
      {children}
    </PageContext.Provider>
  );
};
export const usePageContext: TypeUsePageContext = () => {
  return useContext(PageContext);
};
export default PageProvider;
