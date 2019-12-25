import {h, Component} from "preact" 
import {renderToString} from 'preact-render-to-string';

import {print_object} from "./util.mjs"


class ImportMap extends Component {
  constructor(props) {
    super(props)
    console.log("MOUNT", props)
    //print_object(this)
    //print_object(props)
    this.props.innerHTML= "123"
    this.base = {}
    this.base.innerHTML = 'hello';
  }

  render(props) {
    const import_map_string = JSON.stringify(import_map)
    //let import_map_tag = h('script', {type: "importmap-shim", dangerouslySetInnerHTML: import_map_string})
    //return h('script', {type: "importmap-shim", dangerouslySetInnerHTML: import_map_string} )
    //return h('div', {dangerouslySetInnerHTML: {__html: "foobuu"}})
  }


}

class HTMLDocumentTemplate extends Component {
  render(props, state) {
    
    return h('head', null, 
        h('meta', {charset: 'utf-8'}),
        h('script', {defer: true, src: "https://unpkg.com/es-module-shims"}),
        h('script', {type: 'module-shim', src: "/client.mjs"}),
        //
        h('script', {type: "importmap-shim", src: "/import_map.json"})

      )
  }
  //h('script', {src: '/client.mjs', type: 'module-shim'})
}

// HACK: Pass QuickJS built-in module std and os as variables
export default function(std, os) {
  print("Content-Type: text/html\r")
  print("\r")

  let app = h(HTMLDocumentTemplate)

  let html = renderToString(app)
  print(html)
}