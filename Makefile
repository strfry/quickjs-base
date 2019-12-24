QUICKJS_CFLAGS=-Iquickjs
QUICKJS_LDFLAGS=-Lquickjs -lquickjs -lm -ldl


all: quickjs/qjsc node_loader.so
	quickjs/qjsc -M preact,node_loader -e loader.mjs
	gcc out.c $(QUICKJS_CFLAGS) $(QUICKJS_LDFLAGS)
	./a.out

quickjs/qjsc:
	make -C quickjs -j5

node_loader.so: quickjs/libquickjs.a
	gcc node_loader.c -fPIC -I quickjs -o node_loader.so -shared

