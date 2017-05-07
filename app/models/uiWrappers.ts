namespace uiWrappers {
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

    interface layoutWrapper {
        rows?: any[],
        cols?: any[]
    }

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