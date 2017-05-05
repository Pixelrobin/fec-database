namespace uiWrappers {
    export function wrapInTitle( ui: any, template: string ): any {
        return {
            margin: 0,
            padding: 0,
            rows: [
                {
                    view: "toolbar",
                    borderless: true,
                    height: 36,
                    padding: 0,
                    cols: [
                        {
                            view: "template",
                            template: template,
                            css: "headerbar",
                        }
                    ]
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