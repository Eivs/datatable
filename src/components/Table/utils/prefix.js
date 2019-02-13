import _ from 'lodash';
import classNames from 'classnames';

export const globalKey = 'rs-';
export const getClassNamePrefix = () => {
  if (typeof __RSUITE_CLASSNAME_PREFIX__ !== 'undefined') {
    // eslint-disable-next-line no-undef
    return __RSUITE_CLASSNAME_PREFIX__;
  }

  return globalKey;
};
export const defaultClassPrefix = name => `${getClassNamePrefix()}${name}`;
export const prefix = _.curry((pre, className) => {
  if (!pre || !className) {
    return '';
  }

  if (_.isArray(className)) {
    return classNames(className.filter(name => !!name).map(name => `${pre}-${name}`));
  }

  return `${pre}-${className}`;
});
