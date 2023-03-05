// src/context/state.js
import React, { ReactNode } from "react";
import { AppProviderProps, AppWrapperProps } from "@type/provider/Wrapper";
import RefProvider from "./RefProvider";
import PageProvider from "./PageProvider";
import AuthProvider from "./AuthProvider";
import RouteProvider from "./RouteProvider";

import _ from "lodash";

export default function Wrapper({ children, ...props }: AppWrapperProps) {
  const value = [RefProvider, PageProvider, AuthProvider, RouteProvider];
  return value.reduceRight((acc, Component: any) => {
    return React.createElement(Component, props, acc);
  }, children);
}
