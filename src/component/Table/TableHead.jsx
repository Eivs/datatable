import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class TableHead extends PureComponent {
  static propTypes = {
    columns: PropTypes.array,
  };

  render() {
    const { columns } = this.props;
    return (
      <thead>
        <tr>
          {columns.map(n => (
            <th key={n.dataIndex}>{n.title}</th>
          ))}
        </tr>
      </thead>
    );
  }
}

export default TableHead;
