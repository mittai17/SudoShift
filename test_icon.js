import React from 'react';
import { renderToString } from 'react-dom/server';
import { SiNotion } from 'react-icons/si';

console.log(renderToString(React.createElement(SiNotion)));
