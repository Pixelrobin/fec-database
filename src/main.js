var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var menu_data = [
    { id: "dashboard", icon: "dashboard", value: "Dashboards" },
    { id: "layouts", icon: "columns", value: "Layouts" },
    { id: "tables", icon: "table", value: "Data Tables" },
    { id: "uis", icon: "puzzle-piece", value: "UI Components" },
    { id: "tools", icon: "calendar-o", value: "Tools" },
    { id: "forms", icon: "pencil-square-o", value: "Forms" },
    { id: "demo", icon: "book", value: "Documentation" }
];
/*webix.ready( () => {
webix.ui({
        view: "toolbar", id:"toolbar", elements:[
                {
                        view: "icon", icon: "bars",
                        click: function(){
                                if( $$("menu").config.hidden){
                                        $$("menu").show();
                                }
                                else
                                        $$("menu").hide();
                        }
                },
                {}
        ]
});
 
webix.ui({
        view: "sidemenu",
        id: "menu",
        width: 200,
        position: "left",
        body:{
                view:"list",
                borderless:true,
                scroll: false,
                template: "<span class='webix_icon fa-#icon#'></span> #value#",
                data:[
                        {id: 1, value: "Customers", icon: "user"},
                        {id: 2, value: "Products", icon: "cube"},
                        {id: 3, value: "Reports", icon: "line-chart"},
                        {id: 4, value: "Archives", icon: "database"},
                        {id: 5, value: "Settings", icon: "cog"}
                ]
        }
});

});*/
var webix;
(function (webix) {
    var custom;
    (function (custom) {
        var component = (function () {
            function component() {
                webix.ui(this.layout);
            }
            return component;
        }());
        custom.component = component;
    })(custom = webix.custom || (webix.custom = {}));
})(webix || (webix = {}));
var TestDataTableComponent = (function (_super) {
    __extends(TestDataTableComponent, _super);
    function TestDataTableComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TestDataTableComponent;
}(webix.custom.component));
var test = new webix.custom.component;
webix.ui({
    rows: [
        { view: "toolbar", padding: 3, elements: [
                { view: "button", type: "icon", icon: "bars",
                    width: 37, align: "left", css: "app_button", click: function () {
                        $$("$sidebar1").toggle();
                    }
                },
                { view: "label", label: "My App" },
                {},
                { view: "button", type: "icon", css: "app_button", width: 42, icon: "envelope-o", badge: 4 },
                { view: "button", type: "icon", css: "app_button", width: 42, icon: "bell-o", badge: 10 }
            ]
        },
        {
            cols: [
                {
                    view: "sidebar",
                    data: menu_data,
                    on: {
                        onAfterSelect: function (id) {
                            webix.message("Selected: " + this.getItem(id).value);
                        }
                    }
                },
                { view: "datatable",
                    autoConfig: true,
                    data: {
                        title: "My Fair Lady", year: 1964, votes: 533848, rating: 8.9, rank: 5
                    }
                }
            ]
        }
    ]
});
//	});
/*
webix.ui({
    rows:[
            { view:"template",
                type:"header", template:"My App!" },
            { view:"datatable",
                autoConfig:true,
                data:{
                    title:"My Fair Lady", year:1964, votes:533848, rating:8.9, rank:5
                }
            }
    ]
});

/*class App {

    init(): void {
        var layout: webix.ui.layout = this.createLayout();
        var grid: webix.ui.datatable = layout.getChildViews()[1];
        //this.createDialogs(grid);
    }
    
        createLayout(): webix.ui.layout {

        var datatable:webix.ui.datatableConfig = {
            view:"datatable",
            id:"filmsdata",
            editable:true,
            editaction:"dblclick",
            autoConfig:true,
            //url:"sources/server/films.json",
            pager:"pagerA",
            scrollX:false
        };

        var pager:webix.ui.pagerConfig = {
            view:"pager", id:"pagerA",
            group:10, size:30
        };

        return <webix.ui.layout> webix.ui({
            padding:50,
            width:800,
            height:590,
            type:"space",
            rows:[
                { view:"toolbar", cols:[
                    { view:"label", label:"Film Collection"},
                    {},
                    { view:"button", type:"iconButton", icon:"plus", label:"Add new film", autowidth:true,
                        click: () => this.openDialog("record")},
                    { view:"button", type:"iconButton", icon:"star", label:"Rate film", autowidth:true,
                        click: () => this.openDialog("rating")},
                    { view:"button", type:"iconButton", icon:"share", label:"Share film", autowidth:true,
                        click: () => this.openDialog("share")},
                ]},
                datatable,
                pager
            ]
        });
    }
    /*createDialogs( grid:webix.ui.datatable): void {
        wins.init(grid);
    }
    openDialog(action:string):void {
        //wins.open(action);
        alert( action );
    }
};

var app = new App();
app.init();*/ 
//# sourceMappingURL=main.js.map