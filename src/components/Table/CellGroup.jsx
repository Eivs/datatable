import * as React from 'react';
import classNames from 'classnames';
import { translateDOMPositionXY } from 'dom-lib';
import PropTypes from 'prop-types';
import { defaultClassPrefix, getUnhandledProps, prefix } from './utils';

class CellGroup extends React.PureComponent {
  static propTypes = {
    fixed: PropTypes.oneOf(['left', 'right']),
    width: PropTypes.number,
    height: PropTypes.number,
    left: PropTypes.number,
    style: PropTypes.object,
    className: PropTypes.string,
    classPrefix: PropTypes.string,
  };

  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell-group'),
  };

  addPrefix = (name) => {
    const { classPrefix } = this.props;
    return prefix(classPrefix)(name);
  };

  render() {
    const {
      fixed, width, left, height, style, classPrefix, className, ...rest
    } = this.props;
    const classes = classNames(classPrefix, className, {
      [this.addPrefix(`fixed-${fixed || ''}`)]: fixed,
      [this.addPrefix('scroll')]: !fixed,
    });
    const styles = {
      width,
      height,
      ...style,
    };
    const unhandled = getUnhandledProps(CellGroup, rest);
    translateDOMPositionXY(styles, left, 0);
    return (
      <div
        {...unhandled}
        className={classes}
        style={styles}
      />
    );
  }
}

export default CellGroup;
