console.log(import.meta.url); 
////////////////

import NeedsApp from './needs.mjs'

import {getModel} from './model.mjs'

import {h, render} from "preact"

// Wrapper component to pass in data:

 
// Inject our app into the DOM
render(NeedsApp, document.body);

/*
getModel('http://exodus.strfry.org:82/hq_needs').then(model => {
  var Component = {
//      view: vnode => m('body', m(NeedsApp, {stores:model} ) )
      view: vnode => m(NeedsApp, {stores:model})
  }

//  m.mount(document.body, Component)
  m.mount(document.querySelector('#mountpoint'), Component)
})

*/