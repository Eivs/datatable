import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import diff from 'deep-diff';
import shallowEqual from '../../utils/shallowEqual';

class TableRow extends Component {
  static propTypes = {
    columns: PropTypes.array,
    record: PropTypes.object,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  };

  shouldComponentUpdate(nextProps) {
    const { columns, record, rowKey } = this.props;
    if (
      !shallowEqual(columns, nextProps.columns)
      || !shallowEqual(record, nextProps.record)
      || !shallowEqual(rowKey, nextProps.rowKey)
    ) {
      return true;
    }
    return false;
  }

  render() {
    const { columns, record, rowKey } = this.props;
    const cells = columns.map((column, index) => {
      const { render, dataIndex } = column;
      const res = record[dataIndex];
      const cellkey = `col-${index}-${dataIndex}`;
      if (render) {
        return <td key={cellkey}>{render(res, index, rowKey)}</td>;
      }
      return <td key={cellkey}>{res}</td>;
    });
    return <tr>{cells}</tr>;
  }
}

export default TableRow;
