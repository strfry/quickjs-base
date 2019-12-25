import {enable, disable} from "./node_loader.so"

function import_module(module_name) {
    console.log(`import(${module_name})`)
    var promise = import(module_name).
    then(module => {
        console.log(`loaded ${typeof(module)}`)
        for (var key in module) {
            console.log(key, "=>", module[key])
        }
    }).
    catch(error => console.log(`error loading ${module_name}: ${error}`))
    
}

console.log("import before enable")
import_module("./node_loader.so")

var module = null
enable()

console.log("import after enable")
import_module("./node_loader.so")
import_module("preact")

disable()

console.log("import after disable")

import_module("preact")