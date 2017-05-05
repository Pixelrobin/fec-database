/*
	App configuration
*/

import core = require( "libs/webix-jet-core/core" )
import menu = require( "libs/webix-jet-core/plugins/menu" )
const path = nodeRequire('path');
const url = nodeRequire( 'url' );

//configuration
var app = core.create({
    id:         "my-app",
    name:       "My App!",
    version:    "0.1.0",
    debug:      true,
    start:      "/top/home"
});

app.use(menu);

console.log( url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }))
  console.log( "hey");

export = app;
