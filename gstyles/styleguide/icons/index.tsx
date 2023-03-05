import React from 'react';
import _ from 'lodash';
import colors from '../colors';
import { hexToCSSFilter } from 'hex-to-css-filter';
import helper from '@utils/helper';

// eslint-disable-next-line
// @ts-ignore:next-line
const reqSvgs = require.context('./svgs', true, /\.svg$/);
export const allSvgs = reqSvgs.keys().reduce((images: any, path: string) => {
  const key = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
  images[key] = reqSvgs(path).default;
  if (_.isObject(images[key])) images[key].name = key;
  return images;
}, {});
export interface IconProps {
  name?: string;
  style?: object;
  size?: number;
  color?: string; // là path của colors trong styleguide. (lấy mã màu)
  [key: string]: any;
}
export const getFilterCss = (color: string) => {
  try {
    const cssFilter = hexToCSSFilter(color, {
      acceptanceLossPercentage: 1,
      maxChecks: 10,
    });
    const cssFilterValue = cssFilter.filter.replace(';', '');
    return { filter: cssFilterValue };
  } catch (err) {}
  return {};
};

export const Icons = ({
  name = '',
  size = 24,
  color = '',
  style,
  ...props
}: IconProps) => {
  if (!name) return null;
  color = helper.replaceAll(color, '-', '.');
  const image = allSvgs[name];
  if (!image) return null;
  if (!_.isEmpty(color) && _.isString(_.get(colors, color)))
    color = _.get(colors, color);
  if (!_.isNumber(size)) size = 24;
  return (
    <img
      {...props}
      style={{
        // transition: 'all .3s cubic-bezier(.645,.045,.355,1)',
        ...getFilterCss(color),
        ...style,
      }}
      src={_.get(image, 'src')}
      width={_.isNumber(size) ? size : 24}
      height={_.isNumber(size) ? size : 24}
    />
  );
};
export default Icons;
