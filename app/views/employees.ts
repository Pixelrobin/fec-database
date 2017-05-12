// Main employee view

import uiWrappers = require( "models/uiWrappers" );

declare const ipcRenderer: Electron.IpcRenderer;

export = new class {
    $ui: any; // webix jet ui
    selectedItem: any; // Currently selected employee
    data: any[] = []; // Employee data
    
    constructor() {

        // Employee list
        const list = {
            view:"datatable",
            id: "employeesList",
            autowidth: true,
            select: true,
            columns: [
                {
                    id:"name",
                    header: "Name",//[ {content:"textFilter"} ],
                    width: 200,
                    sort: "string"
                },
                {
                    id:"category",
                    header:"Category",
                    width: 130
                }
            ],
            data: []
        }

        // Employee editor form
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
            ]
        }

        // Add/delete buttons
        const listButtons = [
            { view:"button", id:"employeesAdd", type: "form", align:"left", label: "Add", autowidth: true },
            { view:"button", id:"employeesDelete", type: "danger", align:"left", label: "Delete", autowidth: true }
        ]

        this.$ui = uiWrappers.wrapInLayout( {
                cols: [
                    uiWrappers.wrapInTitle( "EmployeesTitle", list, "Employees", listButtons ),
                    uiWrappers.wrapInTitle( "InformationTitle", form, "Information" )
                ]
            }
        )
    }

    // Webix jet init event
    $oninit = () => {
        const list = $$( "employeesList"   ) as webix.ui.list,
            add    = $$( "employeesAdd"    ) as webix.ui.button,
            del    = $$( "employeesDelete" ) as webix.ui.button,
            
            texts = [
                "employeeName", "employeeCategory",
                "employeeEmail", "employeePhone", "employeeComments"
            ];

        // Events
        add.attachEvent( "onItemClick", () => { this.requestNewEmployee() } )
        del.attachEvent( "onItemClick", () => { this.deleteSelectedEmployee() } )
        list.attachEvent( "onSelectChange", () => {
            this.updateFormValues( list.getSelectedItem( false ) );
        });

        // Add an 'onTimedKeyPress' event to all form inputs
        // For autosaving data
        for ( let t of texts ) {
            ( $$( t ) as webix.ui.text ).attachEvent( "onTimedKeyPress", () => {
                this.saveFormValues();
            } );
        }

        // ipc Events
        ipcRenderer.send( "get-employee-list" );
        ipcRenderer.on( "employee-list-reply", ( event, arg ) => {
            this.parseData( arg );
        } )

        // Update inital values
        // Undefined because no employee is selcted by default
        this.updateFormValues( undefined );
    }

    // Parse data recieved from database and update ui
    parseData( reply: any ): void {
        let list = $$( "employeesList" ) as webix.ui.list;

        if ( reply.id ) {
            // If data is for one entry only, update that
            let found = false;
            
            for ( let e = 0; e < this.data.length; e ++ ) {
                if ( this.data[ e ].id === reply.id ) {
                    this.data[ e ] = reply.rows[ 0 ];
                    found = true;
                    break;
                }
            }

            if ( !found ) this.data.push( reply.rows[ 0 ] );
        } else this.data = reply.rows; // Else update everything
        
        // Submit data to list
        // Todo, submit one piece of data if an id is given
        list.parse( this.data, "json" );
        list.refresh();
    }

    // Update the form with new values
    updateFormValues( obj: any ): void {
        if ( obj === undefined ) {
            // Set defaults and disable form
            obj = { name: "", category: "", email: "", phone: "", comments: "" }
            $$( "employeeForm" ).disable()
        } else $$( "employeeForm" ).enable(); // Enable form

        // Insert values into form ui elements
        ( $$( "employeeName" ) as webix.ui.text ).setValue( obj.name );
        ( $$( "employeeCategory" ) as webix.ui.text ).setValue( obj.category );
        ( $$( "employeeEmail" ) as webix.ui.text ).setValue( obj.email );
        ( $$( "employeePhone" ) as webix.ui.text ).setValue( obj.phone );
        ( $$( "employeeComments" ) as webix.ui.textarea ).setValue( obj.comments );
        
        this.selectedItem = obj;
    }

    // Save the form values to database
    saveFormValues(): void {
        let id = this.selectedItem.id;
        
        // Get form values and update the selected item
        this.selectedItem = {
            id: id,
            name: ( $$( "employeeName" ) as webix.ui.text ).getValue(),
            category: ( $$( "employeeCategory" ) as webix.ui.text ).getValue(),
            email: ( $$( "employeeEmail" ) as webix.ui.text ).getValue(),
            phone: ( $$( "employeePhone" ) as webix.ui.text ).getValue(),
            comments: ( $$( "employeeComments" ) as webix.ui.textarea ).getValue()
        }
        
        // Submit values
        ipcRenderer.send( "set-employee-data", this.selectedItem );
    }

    // Ask database to make a new employee
    requestNewEmployee(): void {
        ipcRenderer.send( "add-employee", {
            name: "New Employee"
        } );
    }

    // Delete currently selected employee and remove them from database
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