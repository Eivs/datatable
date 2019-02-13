import React, { Component } from 'react';
import { Table } from './components/Table';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: true,
    render: name => `${name.first} ${name.last}`,
    width: '20%',
  },
  {
    title: 'Gender',
    dataIndex: 'gender',
    width: '20%',
  },
  {
    title: 'Email',
    dataIndex: 'email',
  },
];

class App extends Component {
  state = {
    data: [],
    selectedKeys: [],
    pagination: {
      pageSize: 100,
    },
    loading: false,
    results: 100,
  };

  componentDidMount() {
    this.getData();
  }

  getData = (params = {}) => {
    const { results } = this.state;
    this.setState({ loading: true });
    const url = new URL('https://randomuser.me/api');
    const newParams = { ...params, results };
    Object.keys(newParams).forEach(key => url.searchParams.append(key, newParams[key]));
    fetch(url, {
      method: 'get',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then((data) => {
        const { pagination } = this.state;
        pagination.total = 200;
        this.setState({
          loading: false,
          data: data.results,
          pagination,
        });
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error(error);
      });
  };

  get rowSelection() {
    const { selectedKeys } = this.state;
    return {
      selectedRowKeys: selectedKeys,
      type: 'checkbox',
      onChange: this.handleSelect,
    };
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { pagination: statePagination } = this.state;
    const pager = { ...statePagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    this.getData({
      results: pagination.pageSize,
      page: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    });
  };

  handleSelect = (selectedRowKeys) => {
    // console.log(selectedRowKeys);
    this.setState({ selectedKeys: selectedRowKeys });
  };

  getRowKey = record => record.login.uuid;

  render() {
    const { data, pagination, loading } = this.state;

    return (
      <div>
        <button
          type="button"
          onClick={() => this.getData()}
        >
          Load & Reload
        </button>
        <Table
          columns={columns}
          rowKey={this.getRowKey}
          rowSelection={this.rowSelection}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default App;
