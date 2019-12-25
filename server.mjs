import {h as m} from "preact" 
import render from 'preact-render-to-string';

const HTMLDocumentTemplate = {
  view: vnode => [
  m('!doctype[html]'),
  m('head',
    m('meta', {charset: 'utf-8'}),
  ),
  m('body',
    m('script', {src: "https://unpkg.com/mithril@1.1.6/mithril.min.js"}),
    m('script', {src: "https://unpkg.com/polythene-mithril/dist/polythene-mithril-standalone.js"}),
    m('script', {src: './bundle.js', defer: true}),
    vnode.children
  )]
}

/*
async function render_index(req, res) {
  const NeedsApp = await import("./needs")
  console.log("await: ", NeedsApp)

  getModel().then(model => {
    console.log("the items i found: ", model)
    
    var template = m(ServerLayout, m(NeedsApp, { stores: model}))

    render(template).then(function (html) {
      res.writeHead(200, {'Content-Type': 'text/html'})
      res.end(html)
    }).catch(error => {
      res.writeHead(500)
      console.log("ERR: ", error)
      res.end(error.stack)
    })
  })
}
*/

import {import_module} from "./util.mjs"
import { print_object } from "./util.mjs"

//import * as std from "std"

class App extends HTMLDocumentTemplate
{
  constructor() {}
}

//const App = `<div class="foo">content</div>;`


// HACK: Pass QuickJS built-in module std and os as variables
export default function(std, os) {
  print("Content-Type: text/html\r")
  print("\r")

  //print("<h1>Hello World</h1>")  

  var app = new App()
  let vnode = {}

  var response = render(app.view(vnode))
  print(response)
}