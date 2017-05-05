import uiWrappers = require( "models/uiWrappers" );

export = new class {
    $ui: any;
    
    constructor() {
        let list = {
            view:"datatable",
            autowidth: true,
            select: true,
            columns: [
                {
                    id:"name",
                    header:[ {content:"textFilter"} ],
                    width: 200
                },
                {
                    id:"category",
                    header:"Category",
                    width: 100
                }
            ],
            data: [
                { name: "Michael Savchuk", category: "Developer" },
                { name: "Kyle Ringo", category: "Boss" }
            ]
        }

        let form = {
            view: "form",
            autoheight: false,
            elements: [
                { view: "text", placeholder: "Ex. John Doe", label: "Name", labelWidth: 100  },
                { view: "text", placeholder: "Ex. Management", label: "Category", labelWidth: 100 },
                { view: "text", placeholder: "Ex. john@mail.com", label: "Email", labelWidth: 100 },
                { view: "text", placeholder: "Ex. (123) 456-789", label: "Phone", labelWidth: 100 },
                { view: "textarea", placeholder: "Any comments you have go here...", label: "Comments", labelWidth: 100 },
                { cols: [
                    { view:"button", value:"Save", type: "form" },
                    { view:"button", value:"Cancel" }
                ]}

            ]
        }

        this.$ui = uiWrappers.wrapInLayout( {
                cols: [
                    uiWrappers.wrapInTitle( list, "Employees" ),
                    uiWrappers.wrapInTitle( form, "Information" )
                ]
            }
        )
    }
}