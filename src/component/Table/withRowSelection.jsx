import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withProps } from 'recompose';

class CheckBox extends PureComponent {
  static propTypes = {
    selectType: PropTypes.string,
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    record: PropTypes.object,
  };

  onClick = (e) => {
    const { onChange, record, rowKey } = this.props;
    const { shiftKey } = e;
    e.stopPropagation();
    onChange(rowKey, record, shiftKey);
  };

  render() {
    const { selectType, checked } = this.props;
    return (
      <input
        type={selectType || 'checkbox'}
        checked={checked}
        onClick={this.onClick}
      />
    );
  }
}
const createCheckBoxCol = (props) => {
  const { rowSelection, columns } = props;
  const { type, onChange } = rowSelection;

  const renderCheckBox = (record, index, rowKey) => (
    <CheckBox
      record={record}
      selectType={type}
      onChange={onChange}
      rowKey={rowKey}
    />
  );

  return [
    {
      dataIndex: 'selection-column',
      title: '',
      render: renderCheckBox,
    },
    ...columns,
  ];
};

const withRowSelection = withProps(props => ({
  columns: createCheckBoxCol(props),
}));

export default withRowSelection;
