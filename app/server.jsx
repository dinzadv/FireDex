import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './main.jsx';

export const render = (route) => renderToString(<App route={route} />);
