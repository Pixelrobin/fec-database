import uiWrappers = require( "models/uiWrappers" );

export = new class {
    $ui: any;
    hours: any;

    constructor() {
        const calendar = {
            view:"calendar",
            id:"attendanceCalendar",
            date: new Date(),
            weekHeader:true,
        }

        const form = {
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

        const datatable: webix.ui.datatableConfig = {
            view: "datatable",
            id: "attendanceDatatable",
            columns: [
                { id: "hour", header: "Hour", autowidth: true },
                { id: "visits", header: "Visits", autowidth: true, editor: "popup" }
            ],
            data: [
                /*{ id: 1, hour: "12:00 PM", visits: 5 },
                { id: 2, hour: "1:00 PM", visits: 123 },
                { id: 3, hour: "2:00 PM", visits: 12 },
                { id: 4, hour: "3:00 PM", visits: 14 }*/
            ],
            editable: true,
            disabled: true
        }

        const info: webix.ui.templateConfig = {
            view: "template",
            template: `
            <h1>127</h1>
            <h4>Visitors Today</h4>
            `,
            height: 150
        }

        const chart: webix.ui.chartConfig = {
            view: "chart",
            type: "splineArea",
            xAxis:{
                title: "Hour",
                template: "#time#",
                lines: true
            },
            yAxis:{
                title: "Test",
                lines: true,
                start: 0,
                end: 10,
                step: 1
            },
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

        const dataButtons: webix.ui.buttonConfig[] = [
            { view:"button", id:"employeesAdd", type: "form", align:"left", label: "Generate Report", autowidth: true }
        ]

        const chartButtons: webix.ui.segmentedConfig[] = [
            {
                view:"segmented",
                options: [
                    { id: "1", value: "Day" }, // the initially selected segment
                    { id: "2", value: "Week" }
                ]
            }
        ]

        webix.editors.$popup.text = {
            view: "popup",
            padding: 0,
            body: { view: "counter", value: 0, min: 0, width: 120, align: "center" }
        }

        this.$ui = uiWrappers.wrapInLayout({
            cols: [
                {
                    margin: 10,
                    rows: [
                        uiWrappers.wrapInTitle( calendar, "Calendar" ),
                        uiWrappers.wrapInTitle( datatable, "Data", dataButtons )
                    ]
                },
                {
                    margin: 10,
                    rows: [
                        {
                            margin: 10,
                            cols: [
                                uiWrappers.wrapInTitle( info, "Visits This Hour" ),
                                uiWrappers.wrapInTitle( info, "Visits Today" ),
                                uiWrappers.wrapInTitle( info, "Visits This Week" )
                            ]
                        },
                        uiWrappers.wrapInTitle( chart, "Graph", chartButtons )
                    ]
                },
            ]
        });
    }

    $oninit = () => {
        let calendar = $$( "attendanceCalendar" ) as webix.ui.calendar;

        calendar.attachEvent( "onDateSelect", ( date: Date ) => {
            let datatable = $$( "attendanceDatatable" ) as webix.ui.datatable;
            this.requestData( date );
        });

        ipcRenderer.send( "get-week-settings" );
        ipcRenderer.on( "get-week-settings-reply", ( event, arg ) => {
            console.log( "got week settings" );
            this.hours = arg;
        });

        ipcRenderer.on( "get-attendance-data-reply", ( event, arg ) => { this.parseData( arg ) } );
    }

    requestData( dateObject: Date ) {
        let datatable = $$( "attendanceDatatable" ) as webix.ui.datatable;

        if ( this.hours[ dateObject.getDay() ].open ) {
            let mnt  = moment( dateObject ),
                day  = mnt.day(),
                smnt = mnt.clone().subtract( day, "days" );
            
            mnt.add( 6 - day, "days" )
            
            ipcRenderer.send( "get-attendance-data", {
                $start: smnt.format( "YYYY-MM-DD" ),
                $end: mnt.format( "YYYY-MM-DD" )
            });

            datatable.enable();
            datatable.parse( this.makeBlankData( dateObject.getDay() ), "json" );
            datatable.refresh();
        } else {
            datatable.disable();
            datatable.showOverlay( "This day is marked as closed. Change your business hours " )
        }

    }

    parseData( data: any ): void {
        console.log( data );
    }

    makeBlankData( weekday: number ): any {
        let data = [], id = 1;

        //weekday ++; // Convert to sqlite id system
        const hours = this.hours[ weekday ];

        for ( let hour = hours.startHour; hour <= hours.endHour; hour ++ ) {
            data.push({
                id: id,
                hour: `${ hour % 12 }:00 ${ hour > 12 ? "AM" : "PM" }`,
                visits: null
            })

            id ++;
        }

        return data;
    }
}