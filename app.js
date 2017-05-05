/*
    App configuration
*/
define("app", ["require", "exports", "libs/webix-jet-core/core", "libs/webix-jet-core/plugins/menu"], function (require, exports, core, menu) {
    "use strict";
    //configuration
    var app = core.create({
        id: "my-app",
        name: "My App!",
        version: "0.1.0",
        debug: true,
        start: "/top/"
    });
    app.use(menu);
    return app;
});
define("views/top", ["require", "exports"], function (require, exports) {
    "use strict";
    var TopView = (function () {
        function TopView() {
            var header = {
                type: "toolbar",
                height: 45,
                borderless: true,
                rows: [
                    {
                        view: "template",
                        template: "Look! A title!"
                    }
                ]
            };
            var menu = {
                view: "list", id: "top:menu",
                width: 180, layout: "y", select: true,
                scroll: false,
                data: [
                    { value: "DashBoard", id: "start", href: "#!/top/start", icon: "envelope-o" },
                    { value: "Data", id: "data", href: "#!/top/data", icon: "briefcase" },
                ]
            };
            var ui = {
                /*type:"layout", cols:[
                    { type:"clean", css:"app-left-panel",
                        padding:10, margin:20, borderless:true, rows: [ header, menu ]},
                    { rows:[ { height:10},
                        { type:"clean", css:"app-right-panel", padding:4, rows:[
                            { $subview:true }
                        ]}
                    ]}
                ]*/
                type: "layout",
                rows: [
                    header,
                    {
                        cols: [menu, { $subview: true }]
                    }
                ]
            };
            this.$ui = ui;
            this.$menu = "top:menu";
        }
        return TopView;
    }());
    return new TopView();
});
