import {enable, disable} from "node_loader"

import {print_object} from "./util.mjs"

import * as std from "std"
import * as os from "os"


enable("/htdocs/node_modules")

import("/htdocs/server.mjs")
.then(module => {
    //print_object(module)
    module.default(std, os)

})
.catch(error => {
    print("\r\nERROR")

    std.err.printf(os.getcwd())

    console.log("error loading module: ", error)
})


//disable()
