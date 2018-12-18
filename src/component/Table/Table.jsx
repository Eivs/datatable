import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import TableHead from './TableHead';
import TableRow from './TableRow';

class Table extends PureComponent {
  static propTypes = {
    columns: PropTypes.array,
    dataSource: PropTypes.array,
    // selectKeys: PropTypes.array,
  };

  static defaultProps = {
    columns: [],
    dataSource: [],
    // selectKeys: [],
  };

  // state = { selectKeys: [] };

  // static getDerivedStateFromProps(nextProps) {
  //   return { selectKeys: nextProps.selectKeys };
  // }

  render() {
    const { columns, dataSource } = this.props;
    return (
      <table>
        <TableHead columns={columns} />
        <tbody>
          {dataSource.map(record => (
            <TableRow
              key={`tr-${JSON.stringify(record)}`}
              record={record}
              columns={columns}
            />
          ))}
        </tbody>
      </table>
    );
  }
}

export default Table;
