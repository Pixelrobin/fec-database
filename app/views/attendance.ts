import uiWrappers = require( "models/uiWrappers" );
import InfoCard = require( "models/InfoCard" );
import PrinterWindow = require( "models/PrinterWindow" );

interface AttendanceDatatable {
    id: number,
    hour: string,
    visits: number
}

interface AttendanceData {
    week: {
        visitsPerDay: number[],
        visitsTotal: number
    }
    day: {
        visitsPerHour: AttendanceDatatable[],
        visitsTotal: number,
        visitsPeak: number
    }
}

export = new class {
    $ui: any;
    hours: any;
    selectedDate: any; // For some reason I can't use 'moment' as a type

    data: AttendanceData = {
        week: {
            visitsPerDay: [],
            visitsTotal: 0
        },
        day: {
            visitsPerHour: [],
            visitsTotal: 0,
            visitsPeak: 0
        }
    }

    HoursInfoCard: InfoCard = new InfoCard( "HoursInfoCard", [
        { header: 1, value: "title", default: "No date selected" },
        { header: 3, value: "desc", default: "Select a date to view/edit its data." },
        { header: 5, value: "subtext", default: "" }
    ], 150 );

    GeneralInfoCard: InfoCard = new InfoCard( "GeneralInfoCard", [
        { header: 1, value: "title", default: "..." },
    ], 150 );

    // Moved outside constructor to allow print() function to access
    datatable: webix.ui.datatableConfig = {
        view: "datatable",
        id: "attendanceDatatable",
        columns: [
            { id: "hour", header: "Hour", autowidth: true },
            { id: "visits", header: "Visits", autowidth: true, editor: "popup" }
        ],
        data: [],
        editable: true
    }

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

        const chart: webix.ui.chartConfig = {
            view: "chart",
            id: "attendanceDayChart",
            type: "splineArea",
            xAxis:{
                title: "Hour",
                template: (o) => { return `${ o.id === 0 ? 12 : o.id % 12 }:00 ${ o.id > 12 ? "PM" : "AM" }` },
                lines: true
            },
            yAxis:{
                title: "Visits",
                lines: true,
                start: 0,
                end: 50,
                step: 5
            },
            value: "#visits#",
            label: "#visits#",
            ariaLabel: "Chart",
            data: []
        }

        const dataButtons: webix.ui.buttonConfig[] = [
            { view:"button", id:"schedulePrint", type: "form", align:"left", label: "Generate Report", autowidth: true }
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
                        uiWrappers.wrapInTitle( "calendarTitle", calendar, "Calendar" ),
                        uiWrappers.wrapInTitle( "datatableTitle", this.datatable, "Data", /*dataButtons*/ )
                    ]
                },
                {
                    margin: 10,
                    rows: [
                        {
                            margin: 10,
                            cols: [
                                uiWrappers.wrapInTitle( "HoursInfoCardTitle", this.HoursInfoCard, "Information" ),
                                uiWrappers.wrapInTitle( "GeneralInfoCardTitle", this.GeneralInfoCard, "Total Visits Today" )
                                //uiWrappers.wrapInTitle( info, "Visits This Week" )
                            ]
                        },
                        uiWrappers.wrapInTitle( "chartTitle", chart, "Graph" )
                    ]
                },
            ]
        });
    }

    $oninit = () => {
        let calendar = $$( "attendanceCalendar" ) as webix.ui.calendar,
            datatable = $$( "attendanceDatatable" ) as webix.ui.datatable,
            schedulePrint = $$( "schedulePrint" ) as webix.ui.button;
        
        //schedulePrint.attachEvent( "onItemClick", () => { this.print() } );

        calendar.attachEvent( "onDateSelect", ( date: Date ) => {
            let datatable = $$( "attendanceDatatable" ) as webix.ui.datatable;
            this.requestData( date );
        });

        datatable.attachEvent( "onAfterEditStop", () => {
            this.updateFromTable();
        });

        ipcRenderer.send( "get-week-settings" );
        ipcRenderer.on( "get-week-settings-reply", ( event, arg ) => {
            console.log( "got week settings" );
            this.hours = arg;
        });

        ipcRenderer.on( "get-attendance-data-reply", ( event, arg ) => { this.parseData( arg ) } );

        this.disable( true );
    }

    requestData( dateObject: Date ) {
        let datatable = $$( "attendanceDatatable" ) as webix.ui.datatable;

        datatable.clearAll();

        let mnt  = moment( dateObject ),
            day  = mnt.day(),
            smnt = mnt.clone().subtract( day, "days" ),
            emnt = mnt.clone().add( 6 - day, "days" )
        
        ipcRenderer.send( "get-attendance-data", {
            start: smnt.format( "YYYY-MM-DD" ),
            end: emnt.format( "YYYY-MM-DD" ),
            day: mnt.format( "YYYY-MM-DD" )
        });

        this.selectedDate = moment( dateObject );
        this.updateCards();
    }

    parseData( data: { weekrows: any[], dayrows: any[] } ): void {
        let datatable = $$( "attendanceDatatable" ) as webix.ui.datatable;

        console.log( data );

        // Week handling
        let visitsPerDay: number[] = [ 0, 0, 0, 0, 0, 0, 0 ],
            visitsTotal: number = 0;

        for ( let d in data.weekrows ) {
            const day = moment( data.weekrows[ d ].date ).day()
            visitsPerDay[ day ] += data.weekrows[ d ].visits;
            visitsTotal += data.weekrows[ d ].visits;
        }

        this.data.week.visitsPerDay = visitsPerDay;
        this.data.week.visitsTotal = visitsTotal;

        // Day handling
        let day = this.selectedDate.day(),
            hours = this.hours[ day ],
            visits = [],
            min = hours.open === 1 ? hours.startHour : 25,
            max = hours.open === 1 ? hours.endHour   : 0;
        
        for ( let r of data.dayrows ) {
            visits[ r.hour.toString() ] = r.visits;
            if ( r.hour > max ) max = r.hour;
            if ( r.hour < min ) min = r.hour;
        }

        let visitsPerHour: AttendanceDatatable[] = [];

        if ( hours.open === 1 || visits.length > 0 ) {
            for ( let h = min; h <= max; h ++ ) {
                visitsPerHour.push({
                    id: h,
                    hour: this.dateString( h ),
                    visits: visits[ h.toString() ] === undefined ? null : visits[ h.toString() ]
                })
            }
            this.disable( false );
        } else {
            this.disable( true );
        }

        this.data.day.visitsPerHour = visitsPerHour;
        datatable.parse( this.data.day.visitsPerHour, "json" );
        datatable.refresh();

        this.updateTotals();
        this.updateCharts();
        this.updateCards();
    }

    updateFromTable(): void {
        let datatable = $$( "attendanceDatatable" ) as webix.ui.datatable;

        this.data.day.visitsPerHour = datatable.serialize();
        ipcRenderer.send( "update-attendance-data", {
            date: this.selectedDate.format( "YYYY-MM-DD" ),
            data: this.data.day.visitsPerHour
        });

        this.updateTotals();
        this.updateCharts();
        this.updateCards();
    }

    updateTotals(): void {
        this.data.day.visitsTotal = 0;
        this.data.day.visitsPeak = 0;
        for ( let d of this.data.day.visitsPerHour ) {
            if ( d.visits > this.data.day.visitsPeak ) this.data.day.visitsPeak = d.visits;
            this.data.day.visitsTotal += d.visits;
        }
    }

    updateCharts(): void {
        let attendanceDayChart = $$( "attendanceDayChart" ) as webix.ui.chart,
            datatable = $$( "attendanceDatatable" ) as webix.ui.datatable;
        
        attendanceDayChart.clearAll();
        attendanceDayChart.define( "yAxis", {
            title: "Visits",
            lines: true,
            start: 0,
            end: this.data.day.visitsPeak + 10,
            step: 5
        } )
        attendanceDayChart.parse( this.data.day.visitsPerHour, "json" );
        attendanceDayChart.refresh();
    }

    updateCards(): void {
        let hours = this.hours[ this.selectedDate.day() ],
            desc  = "";

        if ( hours.open === 1 ) {
            desc = "Open from " + this.dateString( hours.startHour, hours.startMinute )
                + " until " + this.dateString( hours.endHour, hours.endMinute )
        } else desc = `Closed on ${this.selectedDate.format( "dddd" )}s.`

        this.HoursInfoCard.setData({
            title: this.selectedDate.format( "DD MMMM YYYY" ),
            desc: desc,
            subtext: `You can set opeining/closing dates in the settings.`
        })

        this.GeneralInfoCard.setData({
            title: this.data.day.visitsTotal.toString()
        })
    }

    print(): void {
        const datatable = this.datatable;
        datatable.scroll = false;
        datatable.data = this.data.day.visitsPerHour;
        datatable.editable = false;

        let test = [
            this.datatable
        ]
        let PrintWin = new PrinterWindow( "pw", "Customer Attendance Report", test );
    }

    dateString( hour: number, minute?: number ): string {
        /*let m: string = minute === undefined ? "00" : minute.toString();
        return `${ h === 0 ? 12 : h % 12 }:00 ${ h > 12 ? "PM" : "AM" }`*/
        minute = minute === undefined ? 0 : minute;
        return moment( `${ hour }:${ minute }`, "HH:mm" ).format( "hh:mm A" ) )
    }

    disable( disable: boolean ) {
        const things = [ $$( "datatableTitle" ), $$( "GeneralInfoCardTitle" ), $$( "chartTitle" ) ]

        if ( disable ) for ( let t of things ) t.disable();
        else for ( let t of things ) t.enable();
    }
}