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

const rebind_stdio = true

if (rebind_stdio ) {
    if (os.dup2(stdout_fds[1], 1)) {/* error handling */}
    os.close(stdout_fds[1])

    if (os.dup2(stderr_fds[1], 2)) {/* error handling */}
    os.close(stderr_fds[1])
}

var stdout_file = std.fdopen(stdout_fds[0], 'r')
var stderr_file = std.fdopen(stderr_fds[0], 'r')

var stdout_buf = ""
var stderr_buf = ""

let envs = [
    "SERVER_SOFTWARE",
    "SERVER_NAME",
    "SERVER_PROTOCOL",
    "SERVER_PORT",

    "DOCUMENT_ROOT",
    "SERVER_ADMIN",

    "GATEWAY_INTERFACE",
    "REQUEST_METHOD",

    "SCRIPT_FILENAME",
    "SCRIPT_NAME",
    "CONTENT_TYPE",
    "CONTENT_LENGTH",

    "QUERY_STRING",
    "REQUEST_URI",

    "PATH_INFO",
    "PATH_TRANSLATED",

    "AUTH_TYPE",
    "REMOTE_HOST",
    "REMOTE_ADDR",
    "REMOTE_USER",

    "HTTP_USER_AGENT",
    "HTTP_HOST",
    "HTTP_ACCEPT",
    "HTTP_ACCEPT_CHARSET",
    "HTTP_ACCEPT_LANGUAGE",
    "HTTP_CONNECTION",
    "HTTP_REFERER",
    "HTTP_USER_AGENT",
]

function print_environment(stdout) {
    for (var i in envs) {
        const env = envs[i]
        stdout.printf("%s = %s\n", env, std.getenv(env))
    }
}

enable("/htdocs/node_modules")

import("./server.mjs")
.then(module => {
    _std.out.printf("Content-Type: text\r\n")
    _std.out.printf("\r\n")

    try {
        print_environment(_std.out)
        module.default(_std.in, _std.out)
    
    } catch (executionError) {
        _std.out.printf("error %s\n", executionError)
    
        if (rebind_stdio) {
            _std.out.puts("\n--- ERROR DUMP -----\n\n")
            _std.out.printf("stdout: %s\n", stdout_file.readAsString())
             _std.out.printf("stderr: %s\n", stderr_file.readAsString())
        }
    }

    
    
    std.exit(0)
    
})
.catch(error => {
    //std.out.puts("END")
    //std.err.puts("END")
    
    os.close(1)
    os.close(2)

    _std.out.puts("\r\n")

    _std.out.puts("\n---- REPORTED ERROR -----\n")

    _std.out.printf("%s\n", error)
    _std.out.puts("")
    //_std.out.puts(typeof(error))

    if (rebind_stdio) {
        _std.out.puts("\n--- ERROR DUMP -----\n\n")
        _std.out.printf("stdout: %s\n", stdout_file.readAsString())
        _std.out.printf("stderr: %s\n", stderr_file.readAsString())
    }
})

//disable()
