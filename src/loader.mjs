import {enable, disable} from "node_loader"

import * as std from "std"
import * as os from "os"

import {dump, print_object} from "./util.mjs"

enable("/htdocs/node_modules")


function dump_environment() {
//    var input = std.in.readAsString()
//    dump("input: %s\n", input)

//    dump("getcwd %s\n", typeof(os.getcwd()))

    dump("scriptArgs %s\n", scriptArgs)

    dump("getenv %s\n", typeof(os.getenv()))
    print_object(os.getenv())
}

import("/src/server.mjs")
.then(module => {
    print("Content-Type: text/html\r")
    print("\r")
    
    module.default(std, os)

})
.catch(error => {
    dump("\r\nERROR")

    dump_environment()
    console.log("error loading module: ", error)

})


//disable()
