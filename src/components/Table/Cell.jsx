import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { LAYER_WIDTH } from './constants';
import {
  isNullOrUndefined, defaultClassPrefix, getUnhandledProps, prefix,
} from './utils';

class Cell extends React.PureComponent {
  static propTypes = {
    align: PropTypes.oneOf(['left', 'center', 'right']),
    className: PropTypes.string,
    classPrefix: PropTypes.string,
    dataKey: PropTypes.string,
    isHeaderCell: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    left: PropTypes.number,
    headerHeight: PropTypes.number,
    style: PropTypes.object,
    firstColumn: PropTypes.bool,
    lastColumn: PropTypes.bool,
    hasChildren: PropTypes.bool,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rowIndex: PropTypes.number,
    rowData: PropTypes.object,
    depth: PropTypes.number,
    onTreeToggle: PropTypes.func,
    renderTreeToggle: PropTypes.func,
    renderCell: PropTypes.func,
    wordWrap: PropTypes.bool,
    removed: PropTypes.bool,
  };

  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell'),
    align: 'left',
    headerHeight: 36,
    depth: 0,
    height: 36,
    width: 0,
    left: 0,
  };

  addPrefix = (name) => {
    const { classPrefix } = this.props;
    return prefix(classPrefix)(name);
  };

  handleExpandClick = (event) => {
    const {
      onTreeToggle, rowKey, rowIndex, rowData,
    } = this.props;
    if (onTreeToggle) {
      onTreeToggle(rowKey, rowIndex, rowData, event);
    }
  };

  renderExpandIcon() {
    const {
      hasChildren, firstColumn, rowData, renderTreeToggle,
    } = this.props;
    const expandButton = (
      <i
        role="button"
        tabIndex={-1}
        className={this.addPrefix('expand-icon')}
        onClick={(event) => {
          event.stopPropagation();
          this.handleExpandClick(event);
        }}
      />
    );
    /**
     * 如果用子节点，同时是第一列,则创建一个 icon 用于展开节点
     */

    if (hasChildren && firstColumn) {
      return renderTreeToggle ? (
        <span
          role="button"
          tabIndex={-1}
          className={this.addPrefix('expand-wrapper')}
          onClick={this.handleExpandClick}
        >
          {renderTreeToggle(expandButton, rowData)}
        </span>
      ) : (
        expandButton
      );
    }

    return null;
  }

  render() {
    const {
      width,
      left,
      height,
      style,
      className,
      firstColumn,
      lastColumn,
      isHeaderCell,
      headerHeight,
      align,
      children,
      rowData,
      dataKey,
      renderCell,
      removed,
      wordWrap,
      classPrefix,
      depth,
      ...rest
    } = this.props;

    if (removed) {
      return null;
    }

    const classes = classNames(classPrefix, className, {
      [this.addPrefix('first')]: firstColumn,
      [this.addPrefix('last')]: lastColumn,
    });
    const nextHeight = isHeaderCell ? headerHeight : height;
    const styles = {
      width,
      height: nextHeight,
      zIndex: depth,
      left,
    };
    const contentStyles = {
      width,
      height: nextHeight,
      textAlign: align,
      paddingLeft: firstColumn ? depth * LAYER_WIDTH + 10 : null,
      ...style,
    };

    let contentChildren;

    if (isNullOrUndefined(children) && rowData) {
      contentChildren = _.get(rowData, dataKey);
    } else {
      contentChildren = children;
    }

    if (typeof children === 'function') {
      contentChildren = children(rowData);
    }

    const unhandled = getUnhandledProps(Cell, rest, [
      'index',
      'fixed',
      'resizable',
      'flexGrow',
      'minWidth',
      'sortColumn',
      'sortType',
      'onSortColumn',
      'onColumnResizeEnd',
      'onColumnResizeStart',
      'onColumnResizeMove',
      'colSpan',
    ]);
    return (
      <div
        {...unhandled}
        className={classes}
        style={styles}
      >
        {wordWrap ? (
          <div
            className={this.addPrefix('content')}
            style={contentStyles}
          >
            <div className={this.addPrefix('wrap')}>
              {this.renderExpandIcon()}
              {renderCell ? renderCell(contentChildren) : contentChildren}
            </div>
          </div>
        ) : (
          <div
            className={this.addPrefix('content')}
            style={contentStyles}
          >
            {this.renderExpandIcon()}
            {renderCell ? renderCell(contentChildren) : contentChildren}
          </div>
        )}
      </div>
    );
  }
}

export default Cell;
