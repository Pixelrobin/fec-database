import app = require( "app" );

class TopView {
    $ui: any;
    $menu: string;

    constructor() {
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
            view:"menu", id:"top:menu", 
            width:180, layout:"y", select:true,
            padding: 0,
            scroll: false,
            css: "sidemenu",
            template:"<span class='webix_icon fa-#icon#'></span> #value# ",
            data:[
                { value: "Employees", id: "employees", href: "#!/top/employees", icon: "group" },
                { value: "Schedules",  id: "schedules", href: "#!top/schedules", icon: "list" },
                { value: "Attendence", id: "attendence", href: "#!top/attendence", icon: "check" }
            ]
        };
        
        var ui = {
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