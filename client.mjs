console.log(import.meta.url); 
////////////////

import NeedsApp from './needs.mjs'

import {getModel} from './model.mjs'

import {h, render} from "preact"

// Wrapper component to pass in data:

 console.log(NeedsApp)

// Inject our app into the DOM
render(NeedsApp, document.body);
