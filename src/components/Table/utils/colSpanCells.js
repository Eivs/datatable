import React from 'react';
import _ from 'lodash';
import isNullOrUndefined from './isNullOrUndefined';

function cloneCell(Cell, props) {
  return React.cloneElement(Cell, props);
}

function colSpanCells(cells) {
  const nextCells = [];

  for (let i = 0; i < cells.length; i += 1) {
    const { width, colSpan } = cells[i].props;
    /**
     * 如果存在 colSpan 属性，就去找它的下一个 Cell,
     * 看看值是否是 isNullOrUndefined，，如果为空这可以合并这个单元格
     */

    if (colSpan) {
      let nextWidth = width;

      for (let j = 0; j < colSpan; j += 1) {
        const nextCell = cells[i + j];

        if (nextCell) {
          const {
            rowData, dataKey, children, width: colSpanWidth, isHeaderCell,
          } = nextCell.props;

          if (
            (rowData && isNullOrUndefined(_.get(rowData, dataKey)))
            || (isHeaderCell && isNullOrUndefined(children))
          ) {
            nextWidth += colSpanWidth;
            // eslint-disable-next-line no-param-reassign
            cells[i + j] = cloneCell(nextCell, {
              removed: true,
            });
          }
        }
      }

      nextCells.push(
        cloneCell(cells[i], {
          width: nextWidth,
        }),
      );
      // eslint-disable-next-line no-continue
      continue;
    }

    nextCells.push(cells[i]);
  }

  return nextCells;
}

export default colSpanCells;
