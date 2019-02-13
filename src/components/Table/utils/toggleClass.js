import { addClass, removeClass } from 'dom-lib';

const toggleClass = (node, className, condition) => {
  if (condition) {
    addClass(node, className);
  } else {
    removeClass(node, className);
  }
};

export default (node, className, condition) => {
  if (!node) {
    return;
  }

  const hasLengthProperty = obj => Object.prototype.hasOwnProperty.call(obj, 'length');

  if (hasLengthProperty(Object.getPrototypeOf(node))) {
    Array.from(node).forEach((item) => {
      toggleClass(item, className, condition);
    });
    return;
  }

  toggleClass(node, className, condition);
};
