import * as React from 'react';
import classNames from 'classnames';
import { translateDOMPositionXY } from 'dom-lib';
import PropTypes from 'prop-types';
import { defaultClassPrefix, getUnhandledProps, prefix } from './utils';

class Row extends React.PureComponent {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    headerHeight: PropTypes.number,
    top: PropTypes.number,
    isHeaderRow: PropTypes.bool,
    rowRef: PropTypes.instanceOf(React.ElementRef),
    className: PropTypes.string,
    classPrefix: PropTypes.string,
    style: PropTypes.object,
  };

  static defaultProps = {
    classPrefix: defaultClassPrefix('table-row'),
    height: 46,
    headerHeight: 40,
    isHeaderRow: false,
  };

  render() {
    const {
      className,
      width,
      height,
      top,
      style,
      isHeaderRow,
      headerHeight,
      rowRef,
      classPrefix,
      ...rest
    } = this.props;
    const addPrefix = prefix(classPrefix);
    const classes = classNames(classPrefix, className, {
      [addPrefix('header')]: isHeaderRow,
    });
    const styles = {
      minWidth: width,
      height: isHeaderRow ? headerHeight : height,
      ...style,
    };
    translateDOMPositionXY(styles, 0, top);
    const unhandled = getUnhandledProps(Row, rest);
    return (
      <div
        {...unhandled}
        ref={rowRef}
        className={classes}
        style={styles}
      />
    );
  }
}

export default Row;
