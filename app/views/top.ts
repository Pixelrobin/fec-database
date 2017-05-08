// Main view with the titlebar and menu
// TODO: edit list css to make it look more attractive

import app = require( "app" );

export = new class {
    $ui: any; // Webix jet ui
    
    // Used for webix jet
    // Not 100% sure what this does
    $menu: string;

    constructor() {

        // Header element
        var header: webix.ui.toolbarConfig = {
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

        // Side menu element
        var menu: webix.ui.menuConfig = {
            view:"menu", id:"top:menu", 
            width:180, layout:"y", select:true,
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

        this.$ui = {
            rows: [
                header,
                {
                    cols: [ menu, { $subview: true } ]
                }
            ]
        };
        this.$menu = "top:menu";
    }

    // Webix init event
    $oninit = () => {
        // Listen for a change in the business name setting
        ipcRenderer.on( "reset-business-name", ( event, arg ) => {
            this.setBusinessName( arg );
        })

        ipcRenderer.send( "get-business-name" );
    ipcRenderer.on( "get-business-name-reply", ( event, arg ) => {
            this.setBusinessName( arg );
        })
    }

    // Set business name on header
    setBusinessName( name: string ): void {
        let header = $$( "mainHeader" ) as webix.ui.template;

        header.parse( { name: name }, "json" );
    }
}