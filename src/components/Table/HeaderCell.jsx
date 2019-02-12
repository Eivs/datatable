import * as React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Cell from './Cell';
import ColumnResizeHandler from './ColumnResizeHandler';
import {
  isNullOrUndefined, getUnhandledProps, defaultClassPrefix, prefix,
} from './utils';

class HeaderCell extends React.PureComponent {
  static propTypes = {
    width: PropTypes.number,
    dataKey: PropTypes.string,
    left: PropTypes.number,
    className: PropTypes.string,
    classPrefix: PropTypes.string,
    headerHeight: PropTypes.number,
    children: PropTypes.node,
    // self props
    index: PropTypes.number,
    sortColumn: PropTypes.string,
    sortType: PropTypes.oneOf(['desc', 'asc']),
    sortable: PropTypes.bool,
    resizable: PropTypes.bool,
    onColumnResizeStart: PropTypes.func,
    onColumnResizeEnd: PropTypes.func,
    onResize: PropTypes.func,
    onColumnResizeMove: PropTypes.func,
    onSortColumn: PropTypes.func,
    flexGrow: PropTypes.number,
    fixed: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf(['left']),
      PropTypes.oneOf(['right']),
    ]),
  };

  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell-header'),
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.width !== prevState.width || nextProps.flexGrow !== prevState.flexGrow) {
      return {
        width: nextProps.width,
        flexGrow: nextProps.flexGrow,
        columnWidth: isNullOrUndefined(nextProps.flexGrow) ? nextProps.width : 0,
      };
    }

    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      width: props.width,
      flexGrow: props.flexGrow,
      columnWidth: isNullOrUndefined(props.flexGrow) ? props.width : 0,
    };
  }

  handleClick = () => {
    const { sortable, dataKey, onSortColumn } = this.props;

    if (sortable && onSortColumn) {
      onSortColumn(dataKey);
    }
  };

  handleColumnResizeEnd = (columnWidth, cursorDelta) => {
    const {
      dataKey, index, onColumnResizeEnd, onResize,
    } = this.props;
    this.setState({
      columnWidth,
    });
    if (onColumnResizeEnd) {
      onColumnResizeEnd(columnWidth, cursorDelta, dataKey, index);
    }
    if (onResize) {
      onResize(columnWidth, dataKey);
    }
  };

  handleColumnResizeStart = (event) => {
    const { left, fixed, onColumnResizeStart } = this.props;
    const { columnWidth } = this.state;
    this.setState({
      initialEvent: event,
    });
    if (onColumnResizeStart) {
      onColumnResizeStart(columnWidth, left, !!fixed);
    }
  };

  addPrefix = (name) => {
    const { classPrefix } = this.props;
    return prefix(classPrefix)(name);
  };

  renderResizeSpanner() {
    const {
      resizable, left, onColumnResizeMove, fixed, headerHeight,
    } = this.props;
    const { columnWidth, initialEvent } = this.state;

    if (!resizable) {
      return null;
    }

    return (
      <ColumnResizeHandler
        columnWidth={columnWidth}
        columnLeft={left}
        columnFixed={!!fixed}
        height={headerHeight ? headerHeight - 1 : undefined}
        initialEvent={initialEvent}
        onColumnResizeMove={onColumnResizeMove}
        onColumnResizeStart={this.handleColumnResizeStart}
        onColumnResizeEnd={this.handleColumnResizeEnd}
      />
    );
  }

  renderSortColumn() {
    const {
      sortable, sortColumn, sortType = '', dataKey,
    } = this.props;

    if (sortable) {
      const iconClasses = classNames(this.addPrefix('icon-sort'), {
        [this.addPrefix(`icon-sort-${sortType}`)]: sortColumn === dataKey,
      });
      return (
        <span className={this.addPrefix('sort-wrapper')}>
          <i className={iconClasses} />
        </span>
      );
    }

    return null;
  }

  render() {
    const {
      className,
      width,
      dataKey,
      headerHeight,
      children,
      left,
      sortable,
      classPrefix,
      ...rest
    } = this.props;
    const classes = classNames(classPrefix, className, {
      [this.addPrefix('sortable')]: sortable,
    });
    const unhandled = getUnhandledProps(HeaderCell, rest);
    return (
      <div className={classes}>
        <Cell
          {...unhandled}
          width={width}
          dataKey={dataKey}
          left={left}
          headerHeight={headerHeight}
          isHeaderCell
          onClick={this.handleClick}
        >
          {children}
          {this.renderSortColumn()}
        </Cell>

        {this.renderResizeSpanner()}
      </div>
    );
  }
}

export default HeaderCell;
