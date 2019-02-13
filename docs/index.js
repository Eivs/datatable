/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { render } from 'react-dom';
import App from './App';
import 'react-markdown-reader/less/highlight.less';
import 'react-code-view/lib/less/index.less';
import '../src/components/Table/scss/index.scss';

/*
if (process.env.NODE_ENV !== 'production') {
  const { whyDidYouUpdate } = require('why-did-you-update');
  whyDidYouUpdate(React);
}
*/

render(<App />, document.getElementById('app'));

module.hot.accept();
