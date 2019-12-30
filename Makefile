# Copyright 2019 - mail@strfry.org

QUICKJS_PREFIX=/usr/local

QUICKJS_LIBDIR=$(QUICKJS_PREFIX)/lib/quickjs
QUICKJS_INCDIR=$(QUICKJS_PREFIX)/include/quickjs

QUICKJS_CFLAGS=-I$(QUICKJS_INCDIR) # -DJS_SHARED_LIBRARY
QUICKJS_LDFLAGS=-L$(QUICKJS_LIBDIR) -Lquickjs -lquickjs -lpthread -lm -ldl
CC=cc

HAS_QUICKJS=$(shell command -v qjsc)

all: dynamic static quickjs_build


ifndef HAS_QUICKJS
$(warning "No qjsc found in PATH, adding quickjs to dependencies")
QJSC=quickjs/qjsc
$(QJSC): quickjs/libquickjs.a

else

QJSC=qjsc
quickjs_build:

endif


quickjs/libquickjs.a:
	make -C quickjs -j5

node_loader.so: node_loader.c
	$(CC) -fPIC -DJS_SHARED_LIBRARY node_loader.c -I$(QUICKJS_INCDIR) -o node_loader.so -shared 

dynamic: quickjs_build node_loader.so src/loader.mjs src/util.mjs
	$(QJSC) -M node_loader,node_loader -e src/loader.mjs
	${CC} -o dynamic -rdynamic -g node_loader.c out.c $(QUICKJS_CFLAGS) $(QUICKJS_LDFLAGS) -L.


static: quickjs_build node_loader.c src/loader.mjs src/util.mjs
	$(QJSC) -M node_loader,node_loader -e src/loader.mjs
	${CC} -o static -static -g node_loader.c out.c $(QUICKJS_CFLAGS) $(QUICKJS_LDFLAGS) -L.


run: run-static

run-static: node_loader.so static
	./static


deploy: dynamic static
	(test -e cgi-bin || mkdir -p cgi-bin) && (test -e htdocs || mkdir htdocs)
	cp dynamic static cgi-bin
	cp *.mjs htdocs
	cp import_map.json htdocs
	cp package.json htdocs
	cp -r node_modules htdocs
