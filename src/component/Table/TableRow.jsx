import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class TableRow extends PureComponent {
  static propTypes = {
    columns: PropTypes.array,
    record: PropTypes.object,
  };

  render() {
    const { columns, record } = this.props;
    const cells = columns.map((column) => {
      const { render, dataIndex } = column;
      const res = record[dataIndex];
      const key = `${dataIndex}-${res}`;
      if (render) {
        return <td key={key}>{render(res)}</td>;
      }
      return <td key={key}>{res}</td>;
    });
    return <tr>{cells}</tr>;
  }
}

export default TableRow;
