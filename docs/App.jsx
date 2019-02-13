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

import LargeLists from './md/LargeLists.md';
import FixedColumnTable from './md/FixedColumnTable.md';
import AutoHeightTable from './md/AutoHeightTable.md';
import FluidColumnTable from './md/FluidColumnTable.md';
import ResizableColumnTable from './md/ResizableColumnTable.md';
import WordWrapTable from './md/WordWrapTable.md';
import CustomColumnTable from './md/CustomColumnTable.md';
import SortTable from './md/SortTable.md';
import TreeTable from './md/TreeTable.md';
import Expanded from './md/Expanded.md';
import EditTable from './md/EditTable.md';
import LoadingTable from './md/LoadingTable.md';
import ColspanTable from './md/ColspanTable.md';
import HideTableHeader from './md/HideTableHeader.md';
import EmptyDataTable from './md/EmptyDataTable.md';
import DynamicTable from './md/DynamicTable.md';

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
          content: LargeLists,
        },
        {
          title: 'Fixed Column',
          content: FixedColumnTable,
        },
        {
          title: 'Automatic height',
          content: AutoHeightTable,
        },
        {
          title: 'Fluid',
          content: FluidColumnTable,
        },
        {
          title: 'Resizable',
          content: ResizableColumnTable,
        },
        {
          title: 'Word wrap',
          content: WordWrapTable,
        },
        {
          title: 'Custom Cell',
          content: CustomColumnTable,
        },
        {
          title: 'Sort',
          content: SortTable,
        },
        {
          title: 'Tree',
          content: TreeTable,
        },
        {
          title: 'Expandable',
          content: Expanded,
        },
        {
          title: 'Editable',
          content: EditTable,
        },
        {
          title: 'Loading',
          content: LoadingTable,
        },
        {
          title: 'Colspan Cell',
          content: ColspanTable,
        },
        {
          title: 'Hidden header',
          content: HideTableHeader,
        },
        {
          title: 'Empty',
          content: EmptyDataTable,
        },
        {
          title: 'Dynamic',
          content: DynamicTable,
        },
      ]}
    />
  </Grid>
);

export default App;
