import React from 'react';
import { render } from 'react-dom';
import App from './App';
import './style.scss';

/* eslint-disable react/jsx-filename-extension */
render(<App />, document.getElementById('root'));

module.hot.accept();
