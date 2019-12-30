import {enable, disable} from "node_loader"

import * as std from "std"
import * as os from "os"

import {print_object} from "./util.mjs"

var alt_stdout = os.dup(1)
var alt_stderr = os.dup(2)
let stdout_fds = os.pipe()
let stderr_fds = os.pipe()

let _std = {
    out: std.fdopen(alt_stdout, 'w'),
    err: std.fdopen(alt_stderr, 'w'),
}


//if (os.dup2(stdout_fds[1], 1)) {}
//os.close(stdout_fds[1])

//if (os.dup2(stderr_fds[1], 2)) {}
//os.close(stderr_fds[1])


var stdout_file = std.fdopen(stdout_fds[0], 'r')
var stderr_file = std.fdopen(stderr_fds[0], 'r')

var stdout_buf = ""
var stderr_buf = ""



enable("/htdocs/node_modules")

import("/src/server.mjs")
.then(module => {
    print("Content-Type: text/html\r")
    print("\r")

    module.default(_std, os)

    std.exit(0)
})
.catch(error => {
    std.out.puts("END")
    std.err.puts("END")
    
    os.close(1)
    os.close(2)

    _std.out.puts("\r\n")

    _std.out.puts("\n---- REPORTED ERROR -----\n")

    //_std.out.puts(error)
    _std.out.puts("")
    //_std.out.puts(typeof(error))

    _std.out.puts("\n--- ERROR DUMP -----\n\n")

    _std.out.printf("stdout: %s\n", stdout_file.readAsString())
    //_std.out.printf("stderr: %s\n", stderr_file.readAsString())
})

//disable()
