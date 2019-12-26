import {enable, disable} from "node_loader"

import * as std from "std"
import * as os from "os"

import {print_object} from "./util.mjs"

enable("./node_modules")

import("./server.mjs")
.then(module => {
    print("Content-Type: text/html\r")
    print("\r")
    
    module.default(std, os)

})
.catch(error => {
    print("\r\nERROR")

    std.err.printf(os.getcwd())
    print_object(error)

    console.log("error loading module: ", error)
})


//disable()
