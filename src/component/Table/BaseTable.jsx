import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isFunction } from 'lodash';
import shallowEqual from '../../utils/shallowEqual';
import TableHead from './TableHead';
import TableRow from './TableRow';

class Table extends Component {
  static propTypes = {
    columns: PropTypes.array,
    dataSource: PropTypes.array,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  };

  static defaultProps = {
    columns: [],
    dataSource: [],
  };

  shouldComponentUpdate(nextProps) {
    const { columns, dataSource } = this.props;
    if (
      !shallowEqual(columns, nextProps.columns)
      || !shallowEqual(dataSource, nextProps.dataSource)
    ) {
      return true;
    }
    return false;
  }

  getRowKey = (record, index) => {
    const { rowKey } = this.props;
    const key = isFunction(rowKey) ? rowKey(record, index) : record[rowKey];
    return key === undefined ? `row-key-${index}` : key;
  };

  render() {
    const { columns, dataSource } = this.props;
    return (
      <table>
        <TableHead columns={columns} />
        <tbody>
          {dataSource.map((record, index) => {
            const rowKey = this.getRowKey(record, index);
            return (
              <TableRow
                key={rowKey}
                rowKey={rowKey}
                record={record}
                columns={columns}
              />
            );
          })}
        </tbody>
      </table>
    );
  }
}

export default Table;
