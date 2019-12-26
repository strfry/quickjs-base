# Description

This project is about building a platform for isomorphic Javascript (shared code between frontend and backend).
QuickJS is used as a bare-bones javascript engine, though this project provides a loader hook that allows
using modules installed through the npm/yarn ecosystem. After deployment, Node.js is not needed to run server-side javascript.

# Installation

    git clone git://github.com/strfry/quickjs-base --recursive
    cd quickjs/base
    make quickjs # if it isn't available as an OS package
    make


# Running

"Bundle" the JS dependencies and setup the directories for serving;

    make deploy
    cd htdocs && yarn install || npm install

The main application can be tested with

    make run

To try the frontend part, use the Python3 http builtin server as a simple CGI host;

    $ python3 -m http.server --cgi
    Serving HTTP on 0.0.0.0 port 9001 (http://0.0.0.0:8000/) ...

The site should now also load up in a web browser and fetch the required modules.
Your webserver may require specific MIME configration,
to serve `.mjs` with the `Content-Type: application/javascript`. 


# Deployment

If we make any changes in the C or JS loader code, we need to recompile it.
All libraries loaded subsequently through the hook are interpreted dynamically,
and do not need another deployment step except providing those files to the webserver
