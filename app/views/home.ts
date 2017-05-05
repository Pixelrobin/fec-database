class HomeView {
    $ui: any;

    constructor() {
        this.$ui = {
            type: "clean",
            padding: 10,
            css: "layout",
            margin: 10,
            rows: [
                {
                    view: "toolbar",
                    borderless: true,
                    height: 36,
                    padding: 0,
                    cols: [
                        {
                            view: "template",
                            template: "Chart Title",
                            css: "headerbar",
                        }
                    ]
                },
                {
                    view: "chart",
                    type: "spline",
                    value: "#test#",
                    label: "#test#",
                    ariaLabel: "Chart",
                    data: [
                        { id:1, test: 24, time: "5"},
                        { id:2, test: 2,  time: "6"},
                        { id:3, test: 18, time: "7"},
                        { id:4, test: 56, time: "8"}
                    ]
                }
            ]
        }
    }
}

export = new HomeView();