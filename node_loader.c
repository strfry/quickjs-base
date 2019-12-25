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

#include "cutils.h" // has_suffix

#include <assert.h>

#ifdef JS_SHARED_LIBRARY
#define JS_INIT_MODULE js_init_module
#else
#define JS_INIT_MODULE js_init_module_node_loader
#endif

static JSValue get_package_json(JSContext* ctx, const char* package_name)
{
    char filename[1024] = {};
    snprintf(filename, 1024, "./node_modules/%s/package.json", package_name);
    
    uint8_t *buf;
    size_t buf_len;

    buf = js_load_file(ctx, &buf_len, filename);
    if (!buf) {
        perror(filename);
        return JS_NULL;
    }

    JSValue val = JS_ParseJSON(ctx, buf, buf_len, filename);
    js_free(ctx, buf);

    return val;
}

void pprint(JSValue val) {
    
}

JSModuleDef *nodejs_module_loader(JSContext *ctx,
                              const char *module_name, void *opaque)
{
    //printf("nodejs_module_loader: %s\n", module_name);
    if (module_name[0] == '.' || module_name[0] == '/' || has_suffix(module_name, ".so")) {
        // Looks like a relative path, use normal loader
        //puts("EARLY FALLBACK");
        return js_module_loader(ctx, module_name, opaque);
    }

    JSValue json = get_package_json(ctx, module_name);

    // check if json is a real object...
    JSValue modulePath = JS_GetPropertyStr(ctx, json, "module");
    JS_FreeValue(ctx, json);

    if (JS_IsString(modulePath)) {
        char filename[1024];
        const char* c_path = JS_ToCString(ctx, modulePath);
        snprintf(filename, 1024, "./node_modules/%s/%s", module_name, c_path);
        JS_FreeCString(ctx, c_path);

        printf("nodejs_module_loader: %p %s -> %s\n", ctx, module_name, filename);
        JSModuleDef *m = js_module_loader(ctx, filename, opaque);
        if (!m) puts("NATIVE FALLBACK FAILED");
        //pprint(m);
        return m;
    }

    puts("nodejs_module_loader: ERROR");
    return NULL;
}


static JSValue js_node_loader_enable(JSContext *ctx, JSValueConst this_val,
                      int argc, JSValueConst *argv)
{
    //puts("ENABLING NODE LOADER");
    JSRuntime* rt = JS_GetRuntime(ctx);
    JSModuleNormalizeFunc* normalizeFunc = JS_GetModuleNormalizeFunc(rt);
    JSModuleLoaderFunc* loaderFunc = JS_GetModuleLoaderFunc(rt);

    if (0) {
        int n, res;
        JSValue module_name = JS_ToString(ctx, argv[0]);
        if (!JS_IsString(module_name))
            return JS_EXCEPTION;
        const char *cstring = JS_ToCString(ctx, module_name);
        js_module_loader(ctx, cstring, &js_module_loader);
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
    JSModuleNormalizeFunc* normalizeFunc = JS_GetModuleNormalizeFunc(rt);
    JSModuleLoaderFunc* loaderFunc = JS_GetModuleLoaderFunc(rt);

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
    //puts("JS_INIT_MODULE");
    JSModuleDef *m;

    m = JS_NewCModule(ctx, module_name, node_loader_init);

    JS_AddModuleExportList(ctx, m, js_loader_funcs,
        sizeof(js_loader_funcs) / sizeof(js_loader_funcs[0]));

    if (!m)
        return NULL;
    return m;
}