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
                    id: "mainHeader",
                    template: "<h3>#name#<h3>",
                    css: "headerbar",
                    padding: 0,
                    data: { name: "" }
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
                { value: "Attendance", id: "attendance", href: "#!top/attendance", icon: "check" },
                { value: "Employees", id: "employees", href: "#!/top/employees", icon: "group" },
                { value: "Schedules",  id: "schedules", href: "#!top/schedules", icon: "list" },
                { value: "Settings", id: "settings", href: "#!top/settings", icon: "gear" }
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

    $oninit = () => {
        ipcRenderer.on( "reset-business-name", ( event, arg ) => {
            this.setBusinessName( arg );
        })

        ipcRenderer.send( "get-business-name" );
    ipcRenderer.on( "get-business-name-reply", ( event, arg ) => {
            this.setBusinessName( arg );
        })
    }

    setBusinessName( name: string ): void {
        let header = $$( "mainHeader" ) as webix.ui.template;

        header.parse( { name: name }, "json" );
    }
}

export = new TopView();