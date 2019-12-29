/*
 * NodeJS-style module loader hook for QuickJS
 * 
 * Copyright (c) 2017-2018 Fabrice Bellard
 * Copyright (c) 2019 Jonathan Sieber
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
#include "quickjs.h"

#include "quickjs-libc.h" // for js_module_loader

//#include "cutils.h" // has_suffix
int has_suffix(const char *str, const char *suffix);

#include <unistd.h> // getcwd


#include <assert.h>

#include <sys/stat.h> // stat
#include <limits.h> // PATH_MAX
#include <string.h> // strncpy

#ifdef JS_SHARED_LIBRARY
#define JS_INIT_MODULE js_init_module
#else
#define JS_INIT_MODULE js_init_module_node_loader
#endif

static char global_node_modules_path[PATH_MAX] = "./node_modules";
static char global_working_directory_path[PATH_MAX] = "./";

static JSValue get_package_json(JSContext* ctx, const char* module_name)
{
    char filename[1024] = {};
    snprintf(filename, 1024, "%s/%s/%s/package.json", global_working_directory_path, global_node_modules_path, module_name);
    
    uint8_t *buf;
    size_t buf_len;
    struct stat statbuf;

    if (stat(filename, &statbuf)) {
        fprintf(stderr, "nodejs_module_loader: no package.json found for %s (%s)\n", module_name, filename);
        return JS_NULL;
    }

    buf = js_load_file(ctx, &buf_len, filename);
    if (!buf) {
        fprintf(stderr, "nodejs_module_loader: invalid file %s\n", filename);
        return JS_NULL;
    }

    JSValue val = JS_ParseJSON(ctx, (char*)buf, buf_len, filename);
    js_free(ctx, buf);

    return val;
}

void pprint(JSValue val) {
    
}

JSModuleDef *nodejs_module_loader(JSContext *ctx,
                              const char *module_name, void *opaque)
{
    char filename[PATH_MAX] = {};
    snprintf(filename, PATH_MAX, "%s/%s", global_working_directory_path, module_name);

    fprintf(stderr, "nodejs_module_loader: %s -> %s\n", module_name, filename);

    struct stat statbuf;
    if (stat(module_name, &statbuf) == 0 || module_name[0] == '.' || module_name[0] == '/') {
        // Looks like a relative path, use normal loader
        fprintf(stderr, "fallback to js_module_loader\n");
        JSModuleDef *m = js_module_loader(ctx, filename, opaque);
        //puts("js_module_loader");
        return m;
    }


    // lookup in package.json...
    JSValue json = get_package_json(ctx, module_name);
    if (!JS_IsObject(json)) {
        return NULL;
    }

    JSValue modulePath = JS_GetPropertyStr(ctx, json, "module");
    JS_FreeValue(ctx, json);

    if (JS_IsString(modulePath)) {
        char filename[1024];
        const char* c_path = JS_ToCString(ctx, modulePath);
        snprintf(filename, 1024, "%s/%s/%s/%s", global_working_directory_path, global_node_modules_path, module_name, c_path);
        JS_FreeCString(ctx, c_path);

        fprintf(stderr, "nodejs_module_loader: %p %s -> %s\n", ctx, module_name, filename);
        JSModuleDef *m = js_module_loader(ctx, filename, opaque);
        if (!m) puts("NATIVE FALLBACK FAILED");
        return m;
    }

    fprintf(stderr, "nodejs_module_loader: ERROR");
    abort();
    return NULL;
}


static JSValue js_node_loader_enable(JSContext *ctx, JSValueConst this_val,
                      int argc, JSValueConst *argv)
{
    //puts("ENABLING NODE LOADER");
    JSRuntime* rt = JS_GetRuntime(ctx);
    JSModuleNormalizeFunc* normalizeFunc = 0; // JS_GetModuleNormalizeFunc(rt);
    JSModuleLoaderFunc* loaderFunc = 0; // JS_GetModuleLoaderFunc(rt);

    int n, res;
    JSValue modules_path = JS_ToString(ctx, argv[0]);
    if (JS_IsString(modules_path)) {
        const char *cstring = JS_ToCString(ctx, modules_path);
        strncpy(global_node_modules_path, cstring, sizeof(global_node_modules_path));
        JS_FreeCString(ctx, cstring);
    }

    // Dirty...
    if (loaderFunc != nodejs_module_loader) {
        JS_SetModuleLoaderFunc(rt, normalizeFunc, nodejs_module_loader, loaderFunc);
    }
    return JS_UNDEFINED;
}

static JSValue js_node_loader_disable(JSContext *ctx, JSValueConst this_val,
                      int argc, JSValueConst *argv)
{
    //puts("DISABLING NODE LOADER");
    JSRuntime* rt = JS_GetRuntime(ctx);
    JSModuleNormalizeFunc* normalizeFunc = 0; //JS_GetModuleNormalizeFunc(rt);
    JSModuleLoaderFunc* loaderFunc = 0; // JS_GetModuleLoaderFunc(rt);

    assert(loaderFunc == nodejs_module_loader && "node_loader: unexpected module loader function");

    loaderFunc = js_module_loader; // HACK: Restore from properly managed state (jsc_module_loader...)

    assert(loaderFunc != nodejs_module_loader);

    JS_SetModuleLoaderFunc(rt, normalizeFunc, js_module_loader, 0);

    return JS_UNDEFINED;
}

static const JSCFunctionListEntry js_loader_funcs[] = {
    JS_CFUNC_DEF("enable", 1, js_node_loader_enable),
    JS_CFUNC_DEF("disable", 0, js_node_loader_disable),
};

static int node_loader_init(JSContext *ctx, JSModuleDef *m)
{
    return JS_SetModuleExportList(ctx, m, js_loader_funcs,
                                  sizeof(js_loader_funcs) / sizeof(js_loader_funcs[0]));
}


JSModuleDef *JS_INIT_MODULE(JSContext *ctx, const char *module_name)
{
    JSModuleDef *m;

    getcwd(global_working_directory_path, PATH_MAX);

    m = JS_NewCModule(ctx, module_name, node_loader_init);

    JS_AddModuleExportList(ctx, m, js_loader_funcs,
        sizeof(js_loader_funcs) / sizeof(js_loader_funcs[0]));

    if (!m)
        return NULL;
    return m;
}
