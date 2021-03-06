import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import {getQueryParam} from "./utils";

const props = {};
const name = getQueryParam('name');
const width = getQueryParam('width');
const height = getQueryParam('height');
const owner = getQueryParam('owner');
const visitor = getQueryParam('visitor');
const lang = getQueryParam('lang');
const hideToolbar = getQueryParam('hideToolbar');

if (name) props.name = name
if (width) props.width = parseFloat(width);
if (height) props.height = parseFloat(height);
if (owner) props.owner = owner;
if (visitor) props.visitor = visitor;
if (lang) props.lang = lang;
if (hideToolbar) props.hideToolbar = (hideToolbar === 'true');

document.addEventListener('gesturestart', function (event) {
  event.preventDefault()
})

ReactDOM.render(<App {...props} />, document.getElementById('root'));
