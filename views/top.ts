import app = require( "app" );

class TopView {
    $ui: any;
    $menu: string;

    constructor() {
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
            view:"list", id:"top:menu", 
            width:180, layout:"y", select:true,
            scroll: false,
            data:[
                { value:"DashBoard", 		id:"start",		href:"#!/top/start", 		icon:"envelope-o" },
                { value:"Data", 			id:"data",		href:"#!/top/data", 		icon:"briefcase" },
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
                    cols: [ menu, { $subview: true } ]
                }
            ]
        };

        this.$ui = ui;
        this.$menu = "top:menu";
    }
}

export = new TopView();