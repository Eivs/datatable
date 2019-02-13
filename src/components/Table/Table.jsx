import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import bindElementResize, { unbind as unbindElementResize } from 'element-resize-event';
import {
  addStyle,
  getWidth,
  getHeight,
  translateDOMPositionXY,
  WheelHandler,
  scrollLeft,
  scrollTop,
} from 'dom-lib';
import Row from './Row';
import CellGroup from './CellGroup';
import Scrollbar from './Scrollbar';
import {
  getTotalByColumns,
  colSpanCells,
  getUnhandledProps,
  defaultClassPrefix,
  toggleClass,
  flattenData,
  prefix,
  requestAnimationTimeout,
  cancelAnimationTimeout,
} from './utils';

const ReactChildren = React.Children;
const CELL_PADDING_HEIGHT = 26;
const columnHandledProps = [
  'align',
  'width',
  'fixed',
  'resizable',
  'flexGrow',
  'minWidth',
  'colSpan',
];
const SORT_TYPE = {
  DESC: 'desc',
  ASC: 'asc',
};
const SCROLLBAR_WIDHT = 10;

function findRowKeys(rows, rowKey, expanded) {
  let keys = [];

  rows.forEach((item) => {
    if (item.children) {
      keys.push(item[rowKey]);
      keys = [...keys, ...findRowKeys(item.children, rowKey)];
    } else if (expanded) {
      keys.push(item[rowKey]);
    }
  });

  return keys;
}

function findAllParents(rowData, rowKey) {
  const parents = [];

  if (!rowData) {
    return parents;
  }

  function findParent(data) {
    if (data) {
      parents.push(data[rowKey]);

      if (data.parent) {
        findParent(data.parent);
      }
    }
  }

  findParent(rowData.parent);
  return parents;
}

function shouldShowRowByExpanded(expandedRowKeys = [], parentKeys = []) {
  const intersectionKeys = _.intersection(expandedRowKeys, parentKeys);

  if (intersectionKeys.length === parentKeys.length) {
    return true;
  }

  return false;
}

function resetLeftForCells(cells) {
  let left = 0;
  const nextCells = [];

  cells.forEach((cell) => {
    const nextCell = React.cloneElement(cell, {
      left,
    });
    left += cell.props.width;
    nextCells.push(nextCell);
  });

  return nextCells;
}

function getRandomKey(index) {
  return `_${(Math.random() * 1e18)
    .toString(36)
    .slice(0, 5)
    .toUpperCase()}_${index}`;
}

class Table extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    data: PropTypes.arrayOf(PropTypes.object.isRequired),
    height: PropTypes.number,
    autoHeight: PropTypes.bool,
    minHeight: PropTypes.number,
    rowHeight: PropTypes.number,
    headerHeight: PropTypes.number,
    setRowHeight: PropTypes.func,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isTree: PropTypes.bool,
    defaultExpandAllRows: PropTypes.bool,
    defaultExpandedRowKeys: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    ),
    expandedRowKeys: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    ),
    renderTreeToggle: PropTypes.func,
    renderRowExpanded: PropTypes.func,
    rowExpandedHeight: PropTypes.number,
    locale: PropTypes.object,
    style: PropTypes.object,
    sortColumn: PropTypes.string,
    sortType: PropTypes.oneOf(['desc', 'asc']),
    defaultSortType: PropTypes.oneOf(['desc', 'asc']),
    disabledScroll: PropTypes.bool,
    hover: PropTypes.bool,
    loading: PropTypes.bool,
    className: PropTypes.string,
    classPrefix: PropTypes.string,
    children: PropTypes.node,
    bordered: PropTypes.bool,
    cellBordered: PropTypes.bool,
    wordWrap: PropTypes.bool,
    onRowClick: PropTypes.func,
    onScroll: PropTypes.func,
    onSortColumn: PropTypes.func,
    onExpandChange: PropTypes.func,
    onTouchStart: PropTypes.func,
    // for tests
    onTouchMove: PropTypes.func,
    // for tests
    bodyRef: PropTypes.instanceOf(React.ElementRef),
    loadAnimation: PropTypes.bool,
    showHeader: PropTypes.bool,
    rowClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    virtualized: PropTypes.bool,
  };

  static defaultProps = {
    classPrefix: defaultClassPrefix('table'),
    data: [],
    defaultSortType: SORT_TYPE.DESC,
    height: 200,
    rowHeight: 46,
    headerHeight: 40,
    minHeight: 0,
    rowExpandedHeight: 100,
    hover: true,
    showHeader: true,
    virtualized: false,
    rowKey: 'key',
    locale: {
      emptyMessage: 'No data found',
      loading: 'Loading...',
    },
  };

  static getDerivedStateFromProps(props, state) {
    if (props.data !== state.cacheData) {
      return {
        cacheData: props.data,
        data: props.isTree ? flattenData(props.data) : props.data,
      };
    }

    return null;
  }

  constructor(props) {
    super(props);

    this.listenWheel = (deltaX, deltaY) => {
      this.handleWheel(deltaX, deltaY);

      if (this.scrollbarX) {
        this.scrollbarX.onWheelScroll(deltaX);
      }

      if (this.scrollbarY) {
        this.scrollbarY.onWheelScroll(deltaY);
      }
    };

    this.handleSortColumn = (dataKey) => {
      const { onSortColumn, sortColumn } = this.props;
      let sortType = this.getSortType();

      if (sortColumn === dataKey) {
        sortType = sortType === SORT_TYPE.ASC ? SORT_TYPE.DESC : SORT_TYPE.ASC;
        this.setState({
          sortType,
        });
      }

      if (onSortColumn) {
        onSortColumn(dataKey, sortType);
      }
    };

    this.cacheCells = null;

    this.handleColumnResizeEnd = (columnWidth, cursorDelta, dataKey, index) => {
      this.cacheCells = null;
      this.setState({
        isColumnResizing: false,
        [`${dataKey}_${index}_width`]: columnWidth,
      });
      addStyle(this.mouseArea, {
        display: 'none',
      });
    };

    this.handleColumnResizeStart = (width, left, fixed) => {
      this.setState({
        isColumnResizing: true,
      });
      const mouseAreaLeft = width + left;
      const x = fixed ? mouseAreaLeft : mouseAreaLeft + (this.scrollX || 0);
      const styles = {
        display: 'block',
      };
      translateDOMPositionXY(styles, x, 0);
      addStyle(this.mouseArea, styles);
    };

    this.handleColumnResizeMove = (width, left, fixed) => {
      const mouseAreaLeft = width + left;
      const x = fixed ? mouseAreaLeft : mouseAreaLeft + (this.scrollX || 0);
      const styles = {};
      translateDOMPositionXY(styles, x, 0);
      addStyle(this.mouseArea, styles);
    };

    this.handleTreeToggle = (rowKey, rowIndex, rowData) => {
      const { onExpandChange } = this.props;
      const { expandedRowKeys } = this.state;
      let open = false;
      const nextExpandedRowKeys = [];

      expandedRowKeys.forEach((key) => {
        if (key === rowKey) {
          open = true;
        } else {
          nextExpandedRowKeys.push(key);
        }
      });

      if (!open) {
        nextExpandedRowKeys.push(rowKey);
      }

      this.setState({
        expandedRowKeys: nextExpandedRowKeys,
      });

      if (onExpandChange) {
        onExpandChange(!open, rowData);
      }
    };

    this.handleScrollX = (delta) => {
      this.handleWheel(delta, 0);
    };

    this.handleScrollY = (delta) => {
      this.handleWheel(0, delta);
    };

    this.disableEventsTimeoutId = null;

    this.handleWheel = (deltaX, deltaY) => {
      const { onScroll, virtualized } = this.props;

      if (!this.table) {
        return;
      }

      const nextScrollX = this.scrollX - deltaX;
      const nextScrollY = this.scrollY - deltaY;
      this.scrollY = Math.min(0, nextScrollY < this.minScrollY ? this.minScrollY : nextScrollY);
      this.scrollX = Math.min(0, nextScrollX < this.minScrollX ? this.minScrollX : nextScrollX);
      this.updatePosition();

      if (onScroll) {
        onScroll(this.scrollX, this.scrollY);
      }

      if (virtualized) {
        this.setState({
          isScrolling: true,
          scrollY: this.scrollY,
        });

        if (this.disableEventsTimeoutId) {
          cancelAnimationTimeout(this.disableEventsTimeoutId);
        }

        this.disableEventsTimeoutId = requestAnimationTimeout(
          this.debounceScrollEndedCallback,
          150,
        );
      }
    };

    this.debounceScrollEndedCallback = () => {
      this.disableEventsTimeoutId = null;
      this.setState({
        isScrolling: false,
      });
    };

    this.handleTouchStart = (event) => {
      const { onTouchStart } = this.props;
      const { pageX, pageY } = event.touches ? event.touches[0] : {};
      this.touchX = pageX;
      this.touchY = pageY;

      if (onTouchStart) {
        onTouchStart(event);
      }
    };

    this.handleTouchMove = (event) => {
      event.stopPropagation();
      event.preventDefault();
      const { onTouchMove } = this.props;
      const { pageX: nextPageX, pageY: nextPageY } = event.touches ? event.touches[0] : {};
      const deltaX = this.touchX - nextPageX;
      const deltaY = this.touchY - nextPageY;
      this.handleWheel(deltaX, deltaY);
      this.scrollbarX.onWheelScroll(deltaX);
      this.scrollbarY.onWheelScroll(deltaY);
      this.touchX = nextPageX;
      this.touchY = nextPageY;
      if (onTouchMove) {
        onTouchMove(event);
      }
    };

    this.handleBodyScroll = (event) => {
      const left = scrollLeft(event.target);
      const top = scrollTop(event.target);

      if (top === 0 && left === 0) {
        return;
      }
      /**
       * 当用户在 Table 内使用 tab 键，触发了 onScroll 事件，这个时候应该更新滚动条位置
       * Fix: https://github.com/rsuite/rsuite/issues/234
       */

      this.listenWheel(left, top);

      scrollLeft(event.target, 0);
      scrollTop(event.target, 0);
    };

    this.shouldHandleWheelX = (delta) => {
      const { disabledScroll, loading } = this.props;
      const { contentWidth, width } = this.state;

      if (delta === 0 || disabledScroll || loading) {
        return false;
      }

      if (width && contentWidth <= width) {
        return false;
      }

      return (delta >= 0 && this.scrollX > this.minScrollX) || (delta < 0 && this.scrollX < 0);
    };

    this.shouldHandleWheelY = (delta) => {
      const { disabledScroll, loading } = this.props;

      if (delta === 0 || disabledScroll || loading) {
        return false;
      }

      return (delta >= 0 && this.scrollY > this.minScrollY) || (delta < 0 && this.scrollY < 0);
    };

    this.tableRows = [];
    this.mounted = false;
    this.scrollY = 0;
    this.scrollX = 0;
    this.wheelHandler = undefined;
    this.scrollbarX = undefined;
    this.scrollbarY = undefined;
    this.minScrollY = undefined;
    this.minScrollX = undefined;
    this.table = undefined;
    this.mouseArea = undefined;
    this.touchX = undefined;
    this.touchY = undefined;
    this.tableHeader = undefined;
    this.headerWrapper = undefined;
    this.tableBody = undefined;
    this.wheelWrapper = undefined;

    this.addPrefix = (name) => {
      const { classPrefix } = this.props;
      return prefix(classPrefix)(name);
    };

    this.calculateTableWidth = () => {
      const { table } = this;

      if (table) {
        this.scrollX = 0;
        if (this.scrollbarX) {
          this.scrollbarX.resetScrollBarPosition();
        }
        this.cacheCells = null;
        this.setState({
          width: getWidth(table),
        });
      }
    };

    this.scrollTop = (top = 0) => {
      this.scrollY = top;
      if (this.scrollbarY) {
        this.scrollbarY.resetScrollBarPosition(top);
      }
      this.setState({
        scrollY: top,
      });
    };

    this.scrollLeft = (left = 0) => {
      this.scrollX = left;
      if (this.scrollbarX) {
        this.scrollbarX.resetScrollBarPosition(left);
      }
      this.updatePosition();
    };

    this.bindTableRowsRef = index => (ref) => {
      if (ref) {
        this.tableRows[index] = ref;
      }
    };

    this.bindMouseAreaRef = (ref) => {
      this.mouseArea = ref;
    };

    this.bindTableHeaderRef = (ref) => {
      this.tableHeader = ref;
    };

    this.bindHeaderWrapperRef = (ref) => {
      this.headerWrapper = ref;
    };

    this.bindTableRef = (ref) => {
      this.table = ref;
    };

    this.bindWheelWrapperRef = (ref) => {
      const { bodyRef } = this.props;
      this.wheelWrapper = ref;
      if (bodyRef) {
        bodyRef(ref);
      }
    };

    this.bindBodyRef = (ref) => {
      this.tableBody = ref;
    };

    this.bindScrollbarXRef = (ref) => {
      this.scrollbarX = ref;
    };

    this.bindScrollbarYRef = (ref) => {
      this.scrollbarY = ref;
    };

    this.bindRowClick = (rowData) => {
      const { onRowClick } = this.props;
      return () => {
        if (onRowClick) {
          onRowClick(rowData);
        }
      };
    };

    this.rows = [];
    const {
      width: _width,
      data,
      rowKey: _rowKey,
      defaultExpandAllRows,
      renderRowExpanded,
      defaultExpandedRowKeys,
      children = [],
      isTree,
      defaultSortType,
    } = props;

    const expandedRowKeys = defaultExpandAllRows
      ? findRowKeys(data, _rowKey, _.isFunction(renderRowExpanded))
      : defaultExpandedRowKeys || [];

    const shouldFixedColumn = Array.from(children).some(child => _.get(child, 'props.fixed'));

    if (isTree && !_rowKey) {
      throw new Error('The `rowKey` is required when set isTree');
    }

    this.state = {
      expandedRowKeys,
      shouldFixedColumn,
      cacheData: data,
      data: isTree ? flattenData(data) : data,
      width: _width || 0,
      columnWidth: 0,
      dataKey: 0,
      contentHeight: 0,
      contentWidth: 0,
      tableRowsMaxHeight: [],
      sortType: defaultSortType,
      scrollY: 0,
      isScrolling: false,
    };
    this.scrollY = 0;
    this.scrollX = 0;
    this.wheelHandler = new WheelHandler(
      this.listenWheel,
      this.shouldHandleWheelX,
      this.shouldHandleWheelY,
      false,
    );
    this.cacheChildrenSize = _.flatten(children).length;
  }

  componentDidMount() {
    this.calculateTableWidth();
    this.calculateTableContextHeight();
    this.calculateRowMaxHeight();
    bindElementResize(this.table, _.debounce(this.calculateTableWidth, 400));
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { children } = this.props;
    const cacheChildrenSize = _.flatten(nextProps.children).length;

    if (cacheChildrenSize !== this.cacheChildrenSize) {
      this.cacheChildrenSize = cacheChildrenSize;
      this.cacheCells = null;
    }

    if (children !== nextProps.children) {
      this.cacheCells = null;
    }

    return !_.eq(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  componentDidUpdate(prevProps) {
    this.calculateTableContextHeight();
    this.calculateTableContentWidth(prevProps);
    this.calculateRowMaxHeight();
    this.updatePosition();
  }

  componentWillUnmount() {
    this.wheelHandler = null;

    if (this.table) {
      unbindElementResize(this.table);
    }
  }

  getExpandedRowKeys() {
    const { expandedRowKeys } = this.props;
    const { expandedRowKeys: stateExpandedRowKeys } = this.state;
    return _.isUndefined(expandedRowKeys) ? stateExpandedRowKeys : expandedRowKeys;
  }

  getSortType() {
    const { sortType } = this.props;
    const { sortType: stateSortType } = this.state;
    return _.isUndefined(sortType) ? stateSortType : sortType;
  }

  getScrollCellGroups() {
    return this.table.querySelectorAll(`.${this.addPrefix('cell-group-scroll')}`);
  }

  getFixedLeftCellGroups() {
    return this.table.querySelectorAll(`.${this.addPrefix('cell-group-fixed-left')}`);
  }

  getFixedRightCellGroups() {
    return this.table.querySelectorAll(`.${this.addPrefix('cell-group-fixed-right')}`);
  }
  /**
   * 获取表头高度
   */

  getTableHeaderHeight() {
    const { headerHeight, showHeader } = this.props;
    return showHeader ? headerHeight : 0;
  }
  /**
   * 获取 Table 需要渲染的高度
   */

  getTableHeight() {
    const { contentHeight } = this.state;
    const { minHeight, height, autoHeight } = this.props;
    const headerHeight = this.getTableHeaderHeight();
    return autoHeight ? Math.max(headerHeight + contentHeight, minHeight) : height;
  }

  getCells() {
    const { children } = this.props;
    if (this.cacheCells) {
      return this.cacheCells;
    }

    let left = 0; // Cell left margin

    const headerCells = []; // Table header cell

    const bodyCells = []; // Table body cell

    const columns = children;

    if (!columns) {
      this.cacheCells = {
        headerCells,
        bodyCells,
        allColumnsWidth: left,
      };
      return this.cacheCells;
    }
    const { state } = this;
    const { width: tableWidth } = state;
    const { sortColumn, rowHeight, showHeader } = this.props;
    const headerHeight = this.getTableHeaderHeight();
    const { totalFlexGrow, totalWidth } = getTotalByColumns(columns);
    ReactChildren.forEach(columns, (column, index) => {
      if (React.isValidElement(column)) {
        const columnChildren = column.props.children;
        const {
          width, resizable, flexGrow, minWidth, onResize,
        } = column.props;

        if (resizable && flexGrow) {
          console.warn(
            `Cannot set 'resizable' and 'flexGrow' together in <Column>, column index: ${index}`,
          );
        }

        if (columnChildren.length !== 2) {
          throw new Error(`Component <HeaderCell> and <Cell> is required, column index: ${index} `);
        }

        let nextWidth = state[`${columnChildren[1].props.dataKey}_${index}_width`] || width || 0;

        if (tableWidth && flexGrow && totalFlexGrow) {
          nextWidth = Math.max(
            ((tableWidth - totalWidth) / totalFlexGrow) * flexGrow,
            minWidth || 60,
          );
        }

        const cellProps = {
          ..._.pick(column.props, columnHandledProps),
          left,
          index,
          headerHeight,
          key: index,
          width: nextWidth,
          height: rowHeight,
          firstColumn: index === 0,
          lastColumn: index === columns.length - 1,
        };

        if (showHeader && headerHeight) {
          const headerCellProps = {
            dataKey: columnChildren[1].props.dataKey,
            isHeaderCell: true,
            sortable: column.props.sortable,
            onSortColumn: this.handleSortColumn,
            sortType: this.getSortType(),
            sortColumn,
            flexGrow,
          };

          if (resizable) {
            _.merge(headerCellProps, {
              onResize,
              onColumnResizeEnd: this.handleColumnResizeEnd,
              onColumnResizeStart: this.handleColumnResizeStart,
              onColumnResizeMove: this.handleColumnResizeMove,
            });
          }

          headerCells.push(
            React.cloneElement(columnChildren[0], { ...cellProps, ...headerCellProps }),
          );
        }

        bodyCells.push(React.cloneElement(columnChildren[1], cellProps));
        left += nextWidth;
      }
    });
    this.cacheCells = {
      headerCells,
      bodyCells,
      allColumnsWidth: left,
    };
    return this.cacheCells;
  }

  updatePosition() {
    const { shouldFixedColumn } = this.state;
    /**
     * 当存在锁定列情况处理
     */
    if (shouldFixedColumn) {
      this.updatePositionByFixedCell();
    } else {
      const wheelStyle = {};
      const headerStyle = {};
      translateDOMPositionXY(wheelStyle, this.scrollX, this.scrollY);
      translateDOMPositionXY(headerStyle, this.scrollX, 0);
      if (this.wheelWrapper) {
        addStyle(this.wheelWrapper, wheelStyle);
      }
      if (this.headerWrapper) {
        addStyle(this.headerWrapper, headerStyle);
      }
    }

    if (this.tableHeader) {
      toggleClass(this.tableHeader, this.addPrefix('cell-group-shadow'), this.scrollY < 0);
    }
  }

  updatePositionByFixedCell() {
    const wheelGroupStyle = {};
    const wheelStyle = {};
    const scrollGroups = this.getScrollCellGroups();
    const fixedLeftGroups = this.getFixedLeftCellGroups();
    const fixedRightGroups = this.getFixedRightCellGroups();
    const { contentWidth, width } = this.state;
    translateDOMPositionXY(wheelGroupStyle, this.scrollX, 0);
    translateDOMPositionXY(wheelStyle, 0, this.scrollY);
    const scrollArrayGroups = Array.from(scrollGroups);

    scrollArrayGroups.forEach((group) => {
      addStyle(group, wheelGroupStyle);
    });

    if (this.wheelWrapper) {
      addStyle(this.wheelWrapper, wheelStyle);
    }

    const leftShadowClassName = this.addPrefix('cell-group-left-shadow');
    const rightShadowClassName = this.addPrefix('cell-group-right-shadow');
    const showLeftShadow = this.scrollX < 0;
    const showRightShadow = width - contentWidth - SCROLLBAR_WIDHT !== this.scrollX;
    toggleClass(fixedLeftGroups, leftShadowClassName, showLeftShadow);
    toggleClass(fixedRightGroups, rightShadowClassName, showRightShadow);
  }

  shouldUpdateScrollY() {
    const { renderRowExpanded, isTree } = this.props;

    if (isTree || typeof renderRowExpanded === 'function') {
      return false;
    }

    return true;
  }

  shouldRenderExpandedRow(rowData) {
    const { rowKey, renderRowExpanded, isTree } = this.props;
    const expandedRowKeys = this.getExpandedRowKeys() || [];
    return (
      _.isFunction(renderRowExpanded)
      && !isTree
      && expandedRowKeys.some(key => key === rowData[rowKey])
    );
  }

  calculateRowMaxHeight() {
    const { wordWrap } = this.props;

    if (wordWrap) {
      const tableRowsMaxHeight = [];

      this.tableRows.forEach((row) => {
        const cells = row.querySelectorAll(`.${this.addPrefix('cell-wrap')}`) || [];
        let maxHeight = 0;
        const cellArray = Array.from(cells);

        cellArray.forEach((cell) => {
          const h = getHeight(cell);
          maxHeight = Math.max(maxHeight, h);
        });

        tableRowsMaxHeight.push(maxHeight);
      });

      this.setState({
        tableRowsMaxHeight,
      });
    }
  }

  calculateTableContentWidth(prevProps) {
    const { table } = this;
    const { contentWidth: stateContentWidth, width } = this.state;
    const { children } = this.props;
    const row = table.querySelector(`.${this.addPrefix('row')}:not(.virtualized)`);
    const contentWidth = row ? getWidth(row) : 0;
    this.setState({
      contentWidth,
    }); // 这里 -10 是为了让滚动条不挡住内容部分

    this.minScrollX = -(contentWidth - width) - SCROLLBAR_WIDHT;
    /**
     * 1.判断 Table 列数是否发生变化
     * 2.判断 Table 内容区域是否宽度有变化
     * 满足 1 和 2 则更新横向滚动条位置
     */

    if (
      _.flatten(children).length !== _.flatten(prevProps.children).length
      && stateContentWidth !== contentWidth
    ) {
      this.scrollLeft(0);
    }
  }

  calculateTableContextHeight() {
    const { table } = this.table;
    const rows = table.querySelectorAll(`.${this.addPrefix('row')}`) || [];
    const { height, autoHeight, rowHeight } = this.props;
    const headerHeight = this.getTableHeaderHeight();
    const contentHeight = rows.length
      ? Array.from(rows)
        .map(row => getHeight(row) || rowHeight)
        .reduce((x, y) => x + y)
      : 0;
    const nextContentHeight = contentHeight - headerHeight;
    this.setState({
      contentHeight: nextContentHeight,
    });

    if (!autoHeight) {
      // 这里 -10 是为了让滚动条不挡住内容部分
      this.minScrollY = -(contentHeight - height) - 10;
    }

    if (nextContentHeight < height - headerHeight) {
      this.scrollTop(0);
    }
  }

  renderRowData(bodyCells, rowData, props, shouldRenderExpandedRow) {
    const {
      renderTreeToggle, rowKey, wordWrap, isTree,
    } = this.props;
    const hasChildren = isTree && rowData.children && Array.isArray(rowData.children);
    const nextRowKey = rowData[rowKey] || getRandomKey(props.index);
    const rowProps = {
      rowRef: this.bindTableRowsRef(props.index),
      onClick: this.bindRowClick(rowData),
      key: props.index,
      width: props.rowWidth,
      height: props.rowHeight,
      top: props.top,
    };
    const expandedRowKeys = this.getExpandedRowKeys() || [];
    const expanded = expandedRowKeys.some(key => key === rowData[rowKey]);
    const cells = [];

    bodyCells.forEach((cell) => {
      cells.push(
        React.cloneElement(cell, {
          hasChildren,
          rowData,
          wordWrap,
          renderTreeToggle,
          height: props.rowHeight,
          rowIndex: props.index,
          depth: props.depth,
          onTreeToggle: this.handleTreeToggle,
          rowKey: nextRowKey,
          className: classNames({
            [this.addPrefix('cell-expanded')]: expanded,
          }),
        }),
      );
    });

    return this.renderRow(rowProps, cells, shouldRenderExpandedRow, rowData);
  }

  renderRow(props, cells, shouldRenderExpandedRow, rowData) {
    const { rowClassName } = this.props;
    const { shouldFixedColumn, width, contentWidth } = this.state;
    let className = rowClassName;
    if (typeof rowClassName === 'function') {
      className = rowClassName(rowData);
    }
    // IF there are fixed columns, add a fixed group

    if (shouldFixedColumn && contentWidth > width) {
      const fixedLeftCells = [];
      const fixedRightCells = [];
      const scrollCells = [];
      let fixedLeftCellGroupWidth = 0;
      let fixedRightCellGroupWidth = 0;

      cells.forEach((cell) => {
        const { fixed, width: propsWidth } = cell.props;

        if (fixed === true || fixed === 'left') {
          fixedLeftCells.push(cell);
          fixedLeftCellGroupWidth += propsWidth;
        } else if (fixed === 'right') {
          fixedRightCells.push(cell);
          fixedRightCellGroupWidth += propsWidth;
        } else {
          scrollCells.push(cell);
        }
      });

      return (
        <Row
          {...props}
          className={className}
        >
          {fixedLeftCellGroupWidth ? (
            <CellGroup
              fixed="left"
              height={props.isHeaderRow ? props.headerHeight : props.height}
              width={fixedLeftCellGroupWidth}
            >
              {colSpanCells(fixedLeftCells)}
            </CellGroup>
          ) : null}

          <CellGroup>{colSpanCells(scrollCells)}</CellGroup>

          {fixedRightCellGroupWidth ? (
            <CellGroup
              fixed="right"
              style={{
                left: width - fixedRightCellGroupWidth - SCROLLBAR_WIDHT,
              }}
              height={props.isHeaderRow ? props.headerHeight : props.height}
              width={fixedRightCellGroupWidth}
            >
              {colSpanCells(resetLeftForCells(fixedRightCells))}
            </CellGroup>
          ) : null}

          {shouldRenderExpandedRow && this.renderRowExpanded(rowData)}
        </Row>
      );
    }

    return (
      <Row {...props}>
        <CellGroup>{colSpanCells(cells)}</CellGroup>
        {shouldRenderExpandedRow && this.renderRowExpanded(rowData)}
      </Row>
    );
  }

  renderRowExpanded(rowData) {
    const { renderRowExpanded, rowExpandedHeight } = this.props;
    const styles = {
      height: rowExpandedHeight,
    };

    if (typeof renderRowExpanded === 'function') {
      return (
        <div
          className={this.addPrefix('row-expanded')}
          style={styles}
        >
          {renderRowExpanded(rowData)}
        </div>
      );
    }

    return null;
  }

  renderMouseArea() {
    const headerHeight = this.getTableHeaderHeight();
    const styles = {
      height: this.getTableHeight(),
    };
    const spanStyles = {
      height: headerHeight - 1,
    };
    return (
      <div
        ref={this.bindMouseAreaRef}
        className={this.addPrefix('mouse-area')}
        style={styles}
      >
        <span style={spanStyles} />
      </div>
    );
  }

  renderTableHeader(headerCells, rowWidth) {
    const { rowHeight } = this.props;
    const headerHeight = this.getTableHeaderHeight();
    const rowProps = {
      rowRef: this.bindTableHeaderRef,
      width: rowWidth,
      height: rowHeight,
      headerHeight,
      isHeaderRow: true,
      top: 0,
    };
    return (
      <div
        className={this.addPrefix('header-row-wrapper')}
        ref={this.bindHeaderWrapperRef}
      >
        {this.renderRow(rowProps, headerCells)}
      </div>
    );
  }

  renderTableBody(bodyCells, rowWidth) {
    const {
      rowHeight,
      rowExpandedHeight,
      isTree,
      setRowHeight,
      rowKey,
      wordWrap,
      virtualized,
    } = this.props;
    const headerHeight = this.getTableHeaderHeight();
    const {
      tableRowsMaxHeight,
      isScrolling,
      data,
      scrollY,
    } = this.state;
    const height = this.getTableHeight();
    const bodyStyles = {
      top: headerHeight,
      height: height - headerHeight,
    };
    let top = 0; // Row position

    let bodyHeight = 0;
    let topHideHeight = 0;
    let bottomHideHeight = 0;
    this.rows = [];

    if (data) {
      const minTop = Math.abs(scrollY);
      const maxTop = minTop + height + rowExpandedHeight;

      for (let index = 0; index < data.length; index += 1) {
        /* eslint-disable no-continue */
        const rowData = data[index];
        const maxHeight = tableRowsMaxHeight[index];
        let nextRowHeight = maxHeight ? maxHeight + CELL_PADDING_HEIGHT : rowHeight;
        const shouldRenderExpandedRow = this.shouldRenderExpandedRow(rowData);
        let depth = 0;

        if (shouldRenderExpandedRow) {
          nextRowHeight += rowExpandedHeight;
        }

        if (isTree) {
          const parents = findAllParents(rowData, rowKey);
          const expandedRowKeys = this.getExpandedRowKeys();
          depth = parents.length; // 树节点如果被关闭，则不渲染

          if (!shouldShowRowByExpanded(expandedRowKeys, parents)) {
            continue;
          }
        }
        /**
         * 自定义行高
         */

        if (setRowHeight) {
          nextRowHeight = setRowHeight(rowData) || rowHeight;
        }

        bodyHeight += nextRowHeight;
        const rowProps = {
          index,
          top,
          rowWidth,
          depth,
          rowHeight: nextRowHeight,
        };
        top += nextRowHeight;

        if (virtualized && !wordWrap) {
          if (top + nextRowHeight < minTop) {
            topHideHeight += nextRowHeight;
            continue;
          } else if (top > maxTop) {
            bottomHideHeight += nextRowHeight;
            continue;
          }
        }

        this.rows.push(this.renderRowData(bodyCells, rowData, rowProps, shouldRenderExpandedRow));
      }
    }

    const wheelStyles = {
      position: 'absolute',
      height: bodyHeight,
      minHeight: height,
      pointerEvents: isScrolling ? 'none' : '',
    };
    const topRowStyles = {
      height: topHideHeight,
    };
    const bottomRowStyles = {
      height: bottomHideHeight,
    };
    return (
      <div
        ref={this.bindBodyRef}
        className={this.addPrefix('body-row-wrapper')}
        style={bodyStyles}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onWheel={this.wheelHandler.onWheel}
        onScroll={this.handleBodyScroll}
      >
        <div
          style={wheelStyles}
          className={this.addPrefix('body-wheel-area')}
          ref={this.bindWheelWrapperRef}
        >
          {topHideHeight ? (
            <Row
              style={topRowStyles}
              className="virtualized"
            />
          ) : null}
          {this.rows}
          {bottomHideHeight ? (
            <Row
              style={bottomRowStyles}
              className="virtualized"
            />
          ) : null}
        </div>

        {this.renderInfo()}
        {this.renderScrollbar()}
        {this.renderLoading()}
      </div>
    );
  }

  renderInfo() {
    if (this.rows.length) {
      return null;
    }

    const { locale } = this.props;
    return <div className={this.addPrefix('body-info')}>{locale.emptyMessage}</div>;
  }

  renderScrollbar() {
    const { disabledScroll } = this.props;
    const { contentWidth, contentHeight, width } = this.state;
    const headerHeight = this.getTableHeaderHeight();
    const height = this.getTableHeight();

    if (disabledScroll) {
      return null;
    }

    return (
      <div>
        <Scrollbar
          length={width}
          onScroll={this.handleScrollX}
          scrollLength={contentWidth}
          ref={this.bindScrollbarXRef}
        />
        <Scrollbar
          vertical
          length={height - headerHeight}
          scrollLength={contentHeight}
          onScroll={this.handleScrollY}
          ref={this.bindScrollbarYRef}
        />
      </div>
    );
  }
  /**
   *  show loading
   */

  renderLoading() {
    const { locale, loading, loadAnimation } = this.props;

    if (!loadAnimation && !loading) {
      return null;
    }

    return (
      <div className={this.addPrefix('loader-wrapper')}>
        <div className={this.addPrefix('loader')}>
          <i className={this.addPrefix('loader-icon')} />
          <span className={this.addPrefix('loader-text')}>{locale.loading}</span>
        </div>
      </div>
    );
  }

  render() {
    const {
      children,
      className,
      width = 0,
      style,
      isTree,
      hover,
      bordered,
      cellBordered,
      wordWrap,
      classPrefix,
      loading,
      showHeader,
      ...rest
    } = this.props;
    const { isColumnResizing } = this.state;
    const { headerCells, bodyCells, allColumnsWidth } = this.getCells();
    const rowWidth = allColumnsWidth > width ? allColumnsWidth : width;
    const clesses = classNames(classPrefix, className, {
      [this.addPrefix('word-wrap')]: wordWrap,
      [this.addPrefix('treetable')]: isTree,
      [this.addPrefix('bordered')]: bordered,
      [this.addPrefix('cell-bordered')]: cellBordered,
      [this.addPrefix('column-resizing')]: isColumnResizing,
      [this.addPrefix('hover')]: hover,
      [this.addPrefix('loading')]: loading,
    });
    const styles = {
      width: width || 'auto',
      height: this.getTableHeight(),
      ...style,
    };
    const unhandled = getUnhandledProps(Table, rest);
    return (
      <div
        {...unhandled}
        className={clesses}
        style={styles}
        ref={this.bindTableRef}
      >
        {showHeader && this.renderTableHeader(headerCells, rowWidth)}
        {children && this.renderTableBody(bodyCells, rowWidth)}
        {showHeader && this.renderMouseArea()}
      </div>
    );
  }
}

export default Table;
