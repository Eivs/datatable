import { isArray } from 'lodash';

function flattenData(data) {
  const flattenItems = [];

  function loop(items, parent) {
    if (!isArray(items)) {
      return;
    }

    items.forEach((item) => {
      flattenItems.push({ ...item, parent });

      if (item.children) {
        loop(item.children, item);
      }
    });
  }

  loop(data, null);
  return flattenItems;
}

export default flattenData;
