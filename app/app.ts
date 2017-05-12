// App configuration

import core = require( "libs/webix-jet-core/core" )
import menu = require( "libs/webix-jet-core/plugins/menu" )

//configuration
var app = core.create({
    id:         "my-app",
    name:       "FEC Database",
    version:    "0.1.0",
    debug:      true,
    start:      "/top/attendance"
});

app.use(menu);

console.log( "hello from app" );

export = app;