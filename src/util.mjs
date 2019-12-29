

function print_object(obj, depth=0, print=std.out.print) {
    if (typeof(obj)!='object') return print("not an object")
    for (var key in obj) {
        print(depth* "\t", key, "=>", obj[key])

        if (typeof(obj[key] == 'object')) {
            print_object(obj[key], depth+1)
        }
    }
}

function import_module(module_name) {
    dump(`import(${module_name})`)
    var promise = import(module_name).
    then(module => {
        dump(`loaded ${typeof(module)}`)
        print_object(module)
    }).
    catch(error => console.log(`error loading ${module_name}: ${error}`))
    
}

export {print_object, import_module}


// TODO: move to util.mjs
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  }
  function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

export {str2ab, ab2str}
