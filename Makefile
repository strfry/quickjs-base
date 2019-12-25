# Copyright 2019 - mail@strfry.org

QUICKJS_PREFIX=/usr/local/

QUICKJS_LIBDIR=quickjs

QUICKJS_CFLAGS=-Iquickjs # -DJS_SHARED_LIBRARY
QUICKJS_LDFLAGS=-L$(QUICKJS_LIBDIR) -lquickjs -lm -ldl
CC=cc
QJSC=quickjs/qjsc

all: deploy

a.out:  quickjs/qjsc node_loader.so node_loader.c loader.mjs
	$(QJSC) -M preact,node_loader -e loader.mjs
	${CC} -rdynamic -g node_loader.c out.c $(QUICKJS_CFLAGS) $(QUICKJS_LDFLAGS) -L.
	./a.out

dynamic: node_loader.so node_loader.c loader.mjs
	$(QJSC) -M node_loader,node_loader -e loader.mjs
	${CC} -o dynamic -rdynamic -g node_loader.c out.c $(QUICKJS_CFLAGS) $(QUICKJS_LDFLAGS) -L.


static: node_loader.c loader.mjs
	$(QJSC) -M node_loader,node_loader -e loader.mjs
	${CC} -o static -static -g node_loader.c out.c $(QUICKJS_CFLAGS) $(QUICKJS_LDFLAGS) -L.

static-debug: node_loader.c quickjs/libquickjs.debug.a loader.mjs
	quickjs/qjsc -M node_loader,node_loader -e loader.mjs
	gcc -o static-debug -g node_loader.c out.c $(QUICKJS_CFLAGS) quickjs/libquickjs.debug.a -lm -ldl

run: run-static

run-static: node_loader.so static
	./static

	make -C quickjs -j5

node_loader.so: node_loader.c
	$(CC) -fPIC -DJS_SHARED_LIBRARY node_loader.c -I quickjs -o node_loader.so -shared 

deploy: dynamic static
	(test -e cgi-bin || mkdir -p cgi-bin) && (test -e htdocs || mkdir htdocs)
	cp dynamic static cgi-bin
	cp *.mjs htdocs
	cp import_map.json htdocs
