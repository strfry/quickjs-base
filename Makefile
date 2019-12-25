QUICKJS_CFLAGS=-Iquickjs # -DJS_SHARED_LIBRARY
QUICKJS_LDFLAGS=-Lquickjs -lquickjs -lm -ldl


all: quickjs/qjsc node_loader.so
	quickjs/qjsc -M preact,node_loader -e loader.mjs
	gcc -g node_loader.c out.c $(QUICKJS_CFLAGS) $(QUICKJS_LDFLAGS) -L.
	./a.out

quickjs/qjsc:
	make -C quickjs -j5

node_loader.so: quickjs/libquickjs.a node_loader.c
	gcc node_loader.c -fPIC -I quickjs -o node_loader.so -shared

