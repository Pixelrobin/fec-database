import uiWrappers = require( "models/uiWrappers" );

export = new class {
    $ui: any;

    constructor() {
        let calendar = {
            view:"calendar",
            id:"my_calendar",
            date:new Date(2012,3,16),
            weekHeader:true,
        }

        let form = {
            view: "form",
            autoheight: false,
            elements: [
                { view: "number", label: "Visits", labelPosition: "top"  },
                { cols: [
                    { view:"button", value:"Save", type: "form" },
                    { view:"button", value:"Cancel" }
                ]}

            ]
        }

        this.$ui = calendar;
    }
}