QUICKJS_CFLAGS=-Iquickjs # -DJS_SHARED_LIBRARY
QUICKJS_LDFLAGS=-Lquickjs -lquickjs -lm -ldl


all: deploy

a.out:  quickjs/qjsc node_loader.so node_loader.c loader.mjs
	quickjs/qjsc -M preact,node_loader -e loader.mjs
	gcc -rdynamic -g node_loader.c out.c $(QUICKJS_CFLAGS) $(QUICKJS_LDFLAGS) -L.
	./a.out

dynamic: node_loader.so node_loader.c loader.mjs
	quickjs/qjsc -M node_loader,node_loader -e loader.mjs
	gcc -o dynamic -rdynamic -g node_loader.c out.c $(QUICKJS_CFLAGS) $(QUICKJS_LDFLAGS) -L.


static: node_loader.c quickjs/libquickjs.a loader.mjs
	quickjs/qjsc -M ./node_loader.so,node_loader -e loader.mjs
	gcc -o static -rdynamic -g node_loader.c out.c $(QUICKJS_CFLAGS) $(QUICKJS_LDFLAGS) -L.


run: quickjs/qjs node_loader.so
	quickjs/qjs loader.mjs

quickjs/qjsc:
	make -C quickjs -j5

node_loader.so: quickjs/libquickjs.a node_loader.c
	gcc -fPIC -DJS_SHARED_LIBRARY node_loader.c -I quickjs -o node_loader.so -shared 

deploy: dynamic static
	mkdir -p cgi-bin
	cp dynamic static cgi-bin
