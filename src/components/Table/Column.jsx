import PropTypes from 'prop-types';

const Column = () => null;

Column.propTypes = {
  align: PropTypes.oneOf[('left', 'center', 'right')],
  width: PropTypes.number,
  fixed: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['left', 'right'])]),
  resizable: PropTypes.bool,
  sortable: PropTypes.bool,
  flexGrow: PropTypes.number,
  minWidth: PropTypes.number,
  colSpan: PropTypes.number,
  onResize: PropTypes.func,
};

Column.defaultProps = {
  width: 100,
};

export default Column;
