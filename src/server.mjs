import {h, Component} from "preact";
import {renderToString} from 'preact-render-to-string';

import { getModel } from "./model.mjs"
import NeedsApp from "./needs.mjs";


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
    
    return [h('head', null, 
        h('meta', {charset: 'utf-8'}),
        h('script', {defer: true, src: "https://unpkg.com/es-module-shims"}),
        h('script', {type: 'module-shim', src: "/client.mjs"}),
        //
        h('script', {type: "importmap-shim", src: "/import_map.json"})
    ), h('body', null, props.body)]
  }
  //h('script', {src: '/client.mjs', type: 'module-shim'})
}


// HACK: Pass QuickJS built-in module std and os as variables

//import * as std from "std"

//std.out.puts("test")

export default function(stdin, stdout) {
  let model = getModel()

  let app = h(HTMLDocumentTemplate,
    {body: h(NeedsApp, model)}, 
  )

  let html = renderToString(app)
  stdout.puts(html)
}
