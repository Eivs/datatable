import React from 'react';
import { render } from 'react-dom';
import whyDidYouUpdate from 'why-did-you-update';
import App from './App';
import './style.scss';

whyDidYouUpdate(React);

/* eslint-disable react/jsx-filename-extension */
render(<App />, document.getElementById('root'));

module.hot.accept();
