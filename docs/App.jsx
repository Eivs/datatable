/* eslint-disable global-require */
import React from 'react';
import {
  Popover, Whisper, Toggle, Grid, Button, ButtonGroup, Checkbox,
} from 'rsuite';
import clone from 'lodash/clone';
import isFunction from 'lodash/isFunction';
import get from 'lodash/get';
import without from 'lodash/without';
import Examples from './Examples';
import './scss/index.scss';
import {
  Table, Column, Cell, HeaderCell,
} from '../src/components/Table';
import fakeData from './data/users';
import fakeTreeData from './data/treeData';
import fakeDataForColSpan from './data/usersForColSpan';
import fakeLargeData from './data/fakeLargeData.json';
import { createFakeRowObjectData } from './data/fakeObjectDataListStore';

const App = () => (
  <Grid>
    <h1>rsuite-table</h1>
    <p>A React table component</p>
    <p>
      <a href="https://github.com/rsuite/rsuite-table">https://github.com/rsuite/rsuite-table</a>
    </p>
    <hr />
    <Examples
      dependencies={{
        Checkbox,
        Button,
        ButtonGroup,
        Popover,
        Whisper,
        Toggle,
        fakeData,
        fakeTreeData,
        fakeLargeData,
        fakeDataForColSpan,
        Table,
        Column,
        Cell,
        HeaderCell,
        clone,
        createFakeRowObjectData,
        isFunction,
        get,
        without,
      }}
      list={[
        {
          title: 'Virtualized',
          content: require('./md/LargeLists.md'),
        },
        {
          title: 'Fixed Column',
          content: require('./md/FixedColumnTable.md'),
        },
        {
          title: 'Automatic height',
          content: require('./md/AutoHeightTable.md'),
        },
        {
          title: 'Fluid',
          content: require('./md/FluidColumnTable.md'),
        },
        {
          title: 'Resizable',
          content: require('./md/ResizableColumnTable.md'),
        },
        {
          title: 'Word wrap',
          content: require('./md/WordWrapTable.md'),
        },
        {
          title: 'Custom Cell',
          content: require('./md/CustomColumnTable.md'),
        },
        {
          title: 'Sort',
          content: require('./md/SortTable.md'),
        },
        {
          title: 'Tree',
          content: require('./md/TreeTable.md'),
        },
        {
          title: 'Expandable',
          content: require('./md/Expanded.md'),
        },
        {
          title: 'Editable',
          content: require('./md/EditTable.md'),
        },
        {
          title: 'Loading',
          content: require('./md/LoadingTable.md'),
        },
        {
          title: 'Colspan Cell',
          content: require('./md/ColspanTable.md'),
        },
        {
          title: 'Hidden header',
          content: require('./md/HideTableHeader.md'),
        },
        {
          title: 'Empty',
          content: require('./md/EmptyDataTable.md'),
        },
        {
          title: 'Dynamic',
          content: require('./md/DynamicTable.md'),
        },
      ]}
    />
  </Grid>
);

export default App;
