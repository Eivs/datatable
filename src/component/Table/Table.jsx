import { compose, pure } from 'recompose';
import BaseTable from './BaseTable';
import withRowSelection from './withRowSelection';

const withTableLogic = compose(
  withRowSelection,
  pure,
);

export default withTableLogic(BaseTable);
