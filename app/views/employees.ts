import uiWrappers = require( "models/uiWrappers" );

export = new class {
    $ui: any;
    selectedItem: any;
    data: any[] = [];
    
    constructor() {

        const list = {
            view:"datatable",
            id: "employeesList",
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
                    width: 130
                }
            ],
            data: []
        }

        const form: webix.ui.formConfig = {
            view: "form",
            id: "employeeForm",
            autoheight: false,
            elements: [
                { view: "text", id: "employeeName", label: "Name", keyPressTimeout: 500, labelWidth: 100  },
                { view: "text", id: "employeeCategory", label: "Category", keyPressTimeout: 500, labelWidth: 100 },
                { view: "text", id: "employeeEmail", label: "Email", keyPressTimeout: 500, labelWidth: 100 },
                { view: "text", id: "employeePhone", label: "Phone", keyPressTimeout: 500, labelWidth: 100 },
                { view: "textarea", id: "employeeComments", label: "Comments", keyPressTimeout: 500, labelWidth: 100 },
                /*{
                    cols: [
                        { view:"button", id: "employeeSave", value:"Save", type: "form" },
                        { view:"button", id: "employeeCancel", value:"Cancel" }
                    ]
                }*/
            ]
        }

        const listButtons = [
            { view:"button", id:"employeesAdd", type: "form", align:"left", label: "Add", autowidth: true },
            { view:"button", id:"employeesDelete", type: "danger", align:"left", label: "Delete", autowidth: true }
        ]

        this.$ui = uiWrappers.wrapInLayout( {
                cols: [
                    uiWrappers.wrapInTitle( list, "Employees", listButtons ),
                    uiWrappers.wrapInTitle( form, "Information" )
                ]
            }
        )
    }

    $oninit = () => {
        const list = $$( "employeesList"   ) as webix.ui.list,
            add    = $$( "employeesAdd"    ) as webix.ui.button,
            del    = $$( "employeesDelete" ) as webix.ui.button,
            
            texts = [
                "employeeName", "employeeCategory",
                "employeeEmail", "employeePhone", "employeeComments"
            ];
        
        ipcRenderer.on( "employee-list-reply", ( event, arg ) => {
            this.parseReply( arg );
        } )

        list.attachEvent( "onSelectChange", () => {
            this.updateFormValues( list.getSelectedItem( false ) );
            console.log( list.getSelectedId( false ) );
        });

        //save.attachEvent( "onItemClick", () => { this.saveFormValues() } );
        add.attachEvent( "onItemClick", () => { this.requestNewEmployee() } )
        del.attachEvent( "onItemClick", () => { this.deleteSelectedEmployee() } )
        for ( let t of texts ) {
            ( $$( t ) as webix.ui.text ).attachEvent( "onTimedKeyPress", () => {
                console.log( "Saving from " + t );
                this.saveFormValues();
            } );
        }

        ipcRenderer.send( "get-employee-list" );
        this.updateFormValues( undefined );
    }

    parseReply( reply: any ) {
        let list = $$( "employeesList" ) as webix.ui.list;

        if ( reply.id ) {
            let found = false;
            
            for ( let e = 0; e < this.data.length; e ++ ) {
                if ( this.data[ e ].id === reply.id ) {
                    this.data[ e ] = reply.rows[ 0 ];
                    found = true;
                    break;
                }
            }

            if ( !found ) this.data.push( reply.rows[ 0 ] );
        } else {
            console.log( "updating all" );
            this.data = reply.rows;
        }
        
        console.log( this.data );
        list.parse( this.data, "json" );
        list.refresh();
    }

    updateFormValues( obj: any ): void {
        if ( obj === undefined ) {
            obj = { name: "", category: "", email: "", phone: "", comments: "" }
            $$( "employeeForm" ).disable()
        } else {
            $$( "employeeForm" ).enable()
        }

        ( $$( "employeeName" ) as webix.ui.text ).setValue( obj.name );
        ( $$( "employeeCategory" ) as webix.ui.text ).setValue( obj.category );
        ( $$( "employeeEmail" ) as webix.ui.text ).setValue( obj.email );
        ( $$( "employeePhone" ) as webix.ui.text ).setValue( obj.phone );
        ( $$( "employeeComments" ) as webix.ui.textarea ).setValue( obj.comments );
        
        this.selectedItem = obj;
    }

    saveFormValues(): void {
        let id = this.selectedItem.id;
        
        this.selectedItem = {
            id: id,
            name: ( $$( "employeeName" ) as webix.ui.text ).getValue(),
            category: ( $$( "employeeCategory" ) as webix.ui.text ).getValue(),
            email: ( $$( "employeeEmail" ) as webix.ui.text ).getValue(),
            phone: ( $$( "employeePhone" ) as webix.ui.text ).getValue(),
            comments: ( $$( "employeeComments" ) as webix.ui.textarea ).getValue()
        }
        
        ipcRenderer.send( "set-employee-data", this.selectedItem );
    }

    requestNewEmployee(): void {
        ipcRenderer.send( "add-employee", {
            name: "New Employee"
        } );
    }

    deleteSelectedEmployee() {
        const list = $$( "employeesList" ) as webix.ui.list;
        let selectedItem = list.getSelectedItem( false );

        if ( selectedItem ) {
            if ( selectedItem.id ) {
                ipcRenderer.send( "delete-employee", selectedItem.id );
                list.remove( list.getSelectedId( false ) as string );
            }
        }
    }
}