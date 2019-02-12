import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import {
  DOMMouseMoveTracker, addStyle, getOffset, translateDOMPositionXY,
} from 'dom-lib';
import PropTypes from 'prop-types';
import { SCROLLBAR_MIN_WIDTH } from './constants';
import { defaultClassPrefix, getUnhandledProps, prefix } from './utils';

class Scrollbar extends React.PureComponent {
  static propTypes = {
    vertical: PropTypes.bool,
    length: PropTypes.number,
    scrollLength: PropTypes.number,
    className: PropTypes.string,
    classPrefix: PropTypes.string,
    onScroll: PropTypes.func,
    onMouseDown: PropTypes.func,
  };

  static defaultProps = {
    classPrefix: defaultClassPrefix('table-scrollbar'),
    scrollLength: 1,
    length: 1,
  };

  constructor(props) {
    super(props);

    this.state = {
      barOffset: {
        top: 0,
        left: 0,
      },
      handlePressed: false,
    };

    this.scrollOffset = 0;
    this.mouseMoveTracker = undefined;
    this.handle = undefined;
    this.bar = undefined;
  }

  componentDidMount() {
    this.initBarOffset();
  }

  componentWillUnmount() {
    this.releaseMouseMoves();
  }

  onWheelScroll(delta) {
    const { length, scrollLength } = this.props;
    const nextDelta = delta / (scrollLength / length);
    this.updateScrollBarPosition(nextDelta);
  }

  getMouseMoveTracker() {
    return (
      this.mouseMoveTracker
      || new DOMMouseMoveTracker(this.hanldeDragMove, this.hanldeDragEnd, document.body)
    );
  }

  hanldeMouseDown = (event) => {
    const { onMouseDown } = this.props;
    this.mouseMoveTracker = this.getMouseMoveTracker();
    this.mouseMoveTracker.captureMouseMoves(event);
    this.setState({
      handlePressed: true,
    });
    if (onMouseDown) {
      onMouseDown(event);
    }
  };

  hanldeDragEnd = () => {
    this.releaseMouseMoves();
    this.setState({
      handlePressed: false,
    });
  };

  hanldeDragMove = (deltaX, deltaY, event) => {
    const { vertical } = this.props;

    if (!this.mouseMoveTracker || !this.mouseMoveTracker.isDragging()) {
      return;
    }

    this.handleScroll(vertical ? deltaY : deltaX, event);
  };

  hanldeClick = (event) => {
    if (this.handle && this.handle.contains(event.target)) {
      return;
    }

    const { vertical, length, scrollLength } = this.props;
    const { barOffset } = this.state;
    const offset = vertical ? event.pageY - barOffset.top : event.pageX - barOffset.left;
    const handleWidth = (length / scrollLength) * length;
    const delta = offset - handleWidth;
    let nextDelta;
    if (offset > this.scrollOffset) {
      nextDelta = delta - this.scrollOffset;
    } else {
      nextDelta = offset - this.scrollOffset;
    }
    this.handleScroll(nextDelta, event);
  };

  bindBarRef = (ref) => {
    this.bar = ref;
  };

  bindHandleRef = (ref) => {
    this.handle = ref;
  };

  initBarOffset() {
    setTimeout(() => {
      if (this.bar) {
        this.setState({
          barOffset: getOffset(this.bar),
        });
      }
    }, 1);
  }

  handleScroll(delta, event) {
    const { length, scrollLength, onScroll } = this.props;
    const scrollDelta = delta * (scrollLength / length);
    this.updateScrollBarPosition(delta);
    if (onScroll) {
      onScroll(scrollDelta, event);
    }
  }

  resetScrollBarPosition(forceDelta = 0) {
    this.scrollOffset = 0;
    this.updateScrollBarPosition(0, forceDelta);
  }

  updateScrollBarPosition(delta, forceDelta) {
    const { vertical, length, scrollLength } = this.props;
    const max = scrollLength && length
      ? length - Math.max((length / scrollLength) * length, SCROLLBAR_MIN_WIDTH + 2)
      : 0;
    const styles = {};

    if (_.isUndefined(forceDelta)) {
      this.scrollOffset += delta;
      this.scrollOffset = Math.max(this.scrollOffset, 0);
      this.scrollOffset = Math.min(this.scrollOffset, max);
    } else {
      this.scrollOffset = forceDelta || 0;
    }

    if (vertical) {
      translateDOMPositionXY(styles, 0, this.scrollOffset);
    } else {
      translateDOMPositionXY(styles, this.scrollOffset, 0);
    }

    addStyle(this.handle, styles);
  }

  releaseMouseMoves() {
    if (this.mouseMoveTracker) {
      this.mouseMoveTracker.releaseMouseMoves();
      this.mouseMoveTracker = null;
    }
  }

  render() {
    const {
      vertical, length, scrollLength, classPrefix, className, ...rest
    } = this.props;
    const { handlePressed } = this.state;
    const addPrefix = prefix(classPrefix);
    const classes = classNames(classPrefix, className, {
      [addPrefix('vertical')]: vertical,
      [addPrefix('horizontal')]: !vertical,
      [addPrefix('hide')]: scrollLength <= length,
      [addPrefix('pressed')]: handlePressed,
    });
    const styles = {
      [vertical ? 'height' : 'width']: `${(length / scrollLength) * 100}%`,
      [vertical ? 'minHeight' : 'minWidth']: SCROLLBAR_MIN_WIDTH,
    };
    const unhandled = getUnhandledProps(Scrollbar, rest);
    return (
      <div
        {...unhandled}
        ref={this.bindBarRef}
        className={classes}
        onClick={this.hanldeClick}
        role="toolbar"
      >
        <div
          ref={this.bindHandleRef}
          className={addPrefix('handle')}
          style={styles}
          onMouseDown={this.hanldeMouseDown}
          role="button"
          tabIndex={-1}
        />
      </div>
    );
  }
}

export default Scrollbar;
