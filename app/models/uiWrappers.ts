// UI Wrappers for common webix element configurations

namespace uiWrappers {
    // Wrap an element in a window-like appearance with a titlebar
    export function wrapInTitle( id: string, ui: any, template: string, buttons?: any[] ): any {
        const btns = buttons === undefined ? [] : buttons,
        cols = [
            {
                view: "label",
                label: template
            }
        ].concat( btns );
        
        return {
            margin: 0,
            padding: 0,
            id: id,
            rows: [
                {
                    view: "toolbar",
                    borderless: true,
                    height: 36,
                    padding: 0,
                    cols: cols,
                    css: "headerbar"
                },
                ui
            ]
        }
    }

    // Layout wrapper ontions interface
    interface layoutWrapper {
        rows?: any[],
        cols?: any[]
    }

    // Wrap elements into a layout configuration
    export function wrapInLayout( ui: layoutWrapper ): any {
        let lui = ui as any;
        
        lui.type = "clean";
        lui.padding = 10;
        lui.css = "layout";
        lui.margin = 10;
        
        return lui;
    }
}

export = uiWrappers;