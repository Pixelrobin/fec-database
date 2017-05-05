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
        start: "/top/home"
    });
    app.use(menu);
    return app;
});
define("models/uiWrappers", ["require", "exports"], function (require, exports) {
    "use strict";
    var uiWrappers;
    (function (uiWrappers) {
        function wrapInTitle(ui, template) {
            return {
                margin: 0,
                padding: 0,
                rows: [
                    {
                        view: "toolbar",
                        borderless: true,
                        height: 36,
                        padding: 0,
                        cols: [
                            {
                                view: "template",
                                template: template,
                                css: "headerbar",
                            }
                        ]
                    },
                    ui
                ]
            };
        }
        uiWrappers.wrapInTitle = wrapInTitle;
        function wrapInLayout(ui) {
            var lui = ui;
            lui.type = "clean";
            lui.padding = 10;
            lui.css = "layout";
            lui.margin = 10;
            return lui;
        }
        uiWrappers.wrapInLayout = wrapInLayout;
    })(uiWrappers || (uiWrappers = {}));
    return uiWrappers;
});
define("views/attendence", ["require", "exports"], function (require, exports) {
    "use strict";
    return new (function () {
        function class_1() {
            var calendar = {
                view: "calendar",
                id: "my_calendar",
                date: new Date(2012, 3, 16),
                weekHeader: true,
            };
            var form = {
                view: "form",
                autoheight: false,
                elements: [
                    { view: "number", label: "Visits", labelPosition: "top" },
                    { cols: [
                            { view: "button", value: "Save", type: "form" },
                            { view: "button", value: "Cancel" }
                        ] }
                ]
            };
            this.$ui = calendar;
        }
        return class_1;
    }());
});
define("views/employees", ["require", "exports", "models/uiWrappers"], function (require, exports, uiWrappers) {
    "use strict";
    return new (function () {
        function class_2() {
            var list = {
                view: "datatable",
                autowidth: true,
                select: true,
                columns: [
                    {
                        id: "name",
                        header: [{ content: "textFilter" }],
                        width: 200
                    },
                    {
                        id: "category",
                        header: "Category",
                        width: 100
                    }
                ],
                data: [
                    { name: "Michael Savchuk", category: "Developer" },
                    { name: "Kyle Ringo", category: "Boss" }
                ]
            };
            var form = {
                view: "form",
                autoheight: false,
                elements: [
                    { view: "text", placeholder: "Ex. John Doe", label: "Name", labelWidth: 100 },
                    { view: "text", placeholder: "Ex. Management", label: "Category", labelWidth: 100 },
                    { view: "text", placeholder: "Ex. john@mail.com", label: "Email", labelWidth: 100 },
                    { view: "text", placeholder: "Ex. (123) 456-789", label: "Phone", labelWidth: 100 },
                    { view: "textarea", placeholder: "Any comments you have go here...", label: "Comments", labelWidth: 100 },
                    { cols: [
                            { view: "button", value: "Save", type: "form" },
                            { view: "button", value: "Cancel" }
                        ] }
                ]
            };
            this.$ui = uiWrappers.wrapInLayout({
                cols: [
                    uiWrappers.wrapInTitle(list, "Employees"),
                    uiWrappers.wrapInTitle(form, "Information")
                ]
            });
        }
        return class_2;
    }());
});
define("views/home", ["require", "exports"], function (require, exports) {
    "use strict";
    var HomeView = (function () {
        function HomeView() {
            this.$ui = {
                type: "clean",
                padding: 10,
                css: "layout",
                margin: 10,
                rows: [
                    {
                        view: "toolbar",
                        borderless: true,
                        height: 36,
                        padding: 0,
                        cols: [
                            {
                                view: "template",
                                template: "Chart Title",
                                css: "headerbar",
                            }
                        ]
                    },
                    {
                        view: "chart",
                        type: "spline",
                        value: "#test#",
                        label: "#test#",
                        ariaLabel: "Chart",
                        data: [
                            { id: 1, test: 24, time: "5" },
                            { id: 2, test: 2, time: "6" },
                            { id: 3, test: 18, time: "7" },
                            { id: 4, test: 56, time: "8" }
                        ]
                    }
                ]
            };
        }
        return HomeView;
    }());
    return new HomeView();
});
define("views/schedules", ["require", "exports", "models/uiWrappers"], function (require, exports, uiWrappers) {
    "use strict";
    return new (function () {
        function class_3() {
            var calendar = {
                view: "template",
                template: "<div id='calendar'></div>",
                id: "calendar"
            };
            var list = {
                view: "datatable",
                select: true,
                autowidth: true,
                columns: [
                    {
                        id: "name",
                        header: [{ content: "textFilter" }],
                        width: 300
                    }
                ],
                data: [
                    { name: "Janitor" },
                    { name: "Boss" }
                ]
            };
            var form = {
                view: "form",
                autoheight: false,
                elements: [
                    { view: "text", placeholder: "Ex. Putlock lunch", label: "Event Name", labelPosition: "top" },
                    { view: "textarea", placeholder: "Description goes here", label: "Description", labelPosition: "top" },
                    { cols: [
                            { view: "button", value: "Save", type: "form" },
                            { view: "button", value: "Cancel" }
                        ] }
                ]
            };
            this.$ui = uiWrappers.wrapInLayout({
                cols: [
                    {
                        margin: 10,
                        rows: [
                            uiWrappers.wrapInTitle(list, "Schedules"),
                            uiWrappers.wrapInTitle(form, "Event Editor")
                        ]
                    },
                    uiWrappers.wrapInTitle(calendar, "Outlook"),
                ]
            });
        }
        class_3.prototype.$oninit = function () {
            var calendarElement = $("#calendar");
            var createCalendar = function () {
                console.log("creating calendar");
                $("#calendar").fullCalendar({
                    defaultView: "agendaWeek",
                    views: {
                        week: {
                            columnFormat: "dddd"
                        }
                    },
                    header: false,
                    allDaySlot: false
                });
            };
            if (calendarElement.length <= 0) {
                $$("calendar").attachEvent("onAfterRender", createCalendar);
            }
            else
                createCalendar();
        };
        class_3.prototype.$ondestroy = function () {
            $("#calendar").fullCalendar("destroy");
        };
        return class_3;
    }());
});
define("views/start", ["require", "exports"], function (require, exports) {
    "use strict";
    return new (function () {
        function StartView() {
            this.$ui = {
                view: "template",
                template: "Start page"
            };
        }
        return StartView;
    }());
});
define("views/top", ["require", "exports"], function (require, exports) {
    "use strict";
    var TopView = (function () {
        function TopView() {
            var header = {
                view: "toolbar",
                type: "header",
                height: 56,
                padding: 0,
                borderless: true,
                elements: [
                    {
                        view: "template",
                        template: "<h3>Lanes and Lasers<h3>",
                        css: "headerbar",
                        padding: 0
                    }
                ]
            };
            var menu = {
                view: "menu", id: "top:menu",
                width: 180, layout: "y", select: true,
                padding: 0,
                scroll: false,
                css: "sidemenu",
                template: "<span class='webix_icon fa-#icon#'></span> #value# ",
                data: [
                    { value: "DashBoard", id: "start", href: "#!/top/start", icon: "envelope-o" },
                    { value: "Home", id: "home", href: "#!/top/home", icon: "briefcase" },
                    { value: "Employees", id: "employees", href: "#!/top/employees" },
                    { value: "Schedules", id: "schedules", href: "#!top/schedules" },
                    { value: "Attendence", id: "attendence", href: "#!top/attendence" }
                ]
            };
            var ui = {
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
