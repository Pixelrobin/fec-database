class PrinterWindow {
    view: string = "window";
    id: string;
    fullscreen: boolean = true;
    head: string;
    body: any;
    
    constructor( id: string, head: string, rows: any[] ) {
        this.id = id;
        this.head = head;

        rows = [
            {
                view: "toolbar",
                id: "printToolbar",
                cols: [
                    { view:"button", id:"printPrint", type: "form", value:"Print", align:"left", width: 100 },
                    { view:"button", id:"printCancel", value:"Cancel", align:"left", width: 100 }
                ]
            }
        ].concat( rows);

        this.body = {
            view: "layout",
            rows: rows
        }
        webix.ui( this );
        
        let win    = $$( id ) as webix.ui.window,
            print  = $$( "printPrint"   ) as webix.ui.button,
            cancel = $$( "printCancel"  ) as webix.ui.button,
            tools  = $$( "printToolbar" ) as webix.ui.toolbar;
        
        win.show();
        win.getHead().destructor();

        print.attachEvent( "onItemClick", () => {
            tools.hide();
            ipcRenderer.send( "print" );
            ipcRenderer.once( "print-done", ( e, a ) => { win.close() } )
        })

        cancel.attachEvent( "onItemClick", () => {
            win.close();
        })
        //ipcRenderer.send( "print" );
    }

    $$id(): webix.ui.template {
        return $$( this.id ) as webix.ui.template;
    }

}

export = PrinterWindow;