/*
	App configuration
*/

import core = require( "libs/webix-jet-core/core" )
import menu = require( "libs/webix-jet-core/plugins/menu" )

//configuration
var app = core.create({
    id:         "my-app",
    name:       "My App!",
    version:    "0.1.0",
    debug:      true,
    start:      "/top/home"
});

app.use(menu);

export = app;
