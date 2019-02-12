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

  if (Object.getPrototypeOf(node).hasOwnProperty('length')) {
    Array.from(node).forEach((item) => {
      toggleClass(item, className, condition);
    });
    return;
  }

  toggleClass(node, className, condition);
};
