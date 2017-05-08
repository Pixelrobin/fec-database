// Main attendance view

import uiWrappers = require( "models/uiWrappers" );
import InfoCard = require( "models/InfoCard" );
import PrinterWindow = require( "models/PrinterWindow" );

// Attendance datatable interface
interface AttendanceDatatable {
    id: number,
    hour: string,
    visits: number
}

// Class data interface
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
    $ui: any; // webix jet ui
    hours: any; // hours open per day (loaded from settings)
    selectedDate: any; // For some reason I can't use 'moment' as a type

    // General data (week data is unused, was not able to implemnt it in time)
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

    // Hours infocard
    HoursInfoCard: InfoCard = new InfoCard( "HoursInfoCard", [
        { header: 1, value: "title", default: "No date selected" },
        { header: 3, value: "desc", default: "Select a date to view/edit its data." },
        { header: 5, value: "subtext", default: "" }
    ], 150 );

    // General infocard (for now just displays total visits per day)
    GeneralInfoCard: InfoCard = new InfoCard( "GeneralInfoCard", [
        { header: 1, value: "title", default: "..." },
    ], 150 );

    // Datatable for editing selected day data
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
        // Date selection calendar
        const calendar: webix.ui.calendarConfig = {
            view:"calendar",
            id:"attendanceCalendar",
            date: new Date() as any, // Typescript wants a string|Date :\
            weekHeader:true,
        }

        // Main data graph
        const chart: webix.ui.chartConfig = {
            view: "chart",
            id: "attendanceDayChart",
            type: "splineArea",
            xAxis:{
                title: "Hour",
                template: (o) => {
                    return `${ o.id === 0 ? 12 : o.id % 12 }:00 ${ o.id > 12 ? "PM" : "AM" }`
                },
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

        // Print button (in array because thats what wrapInTitle requires)
        const dataButtons: webix.ui.buttonConfig[] = [
            { view:"button", id:"schedulePrint", type: "form", align:"left", label: "Generate Report", autowidth: true }
        ]

        // Custom datatable text editor
        webix.editors.$popup.text = {
            view: "popup",
            padding: 0,
            body: { view: "counter", value: 0, min: 0, width: 120, align: "center" }
        }

        // Main ui
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
                            ]
                        },
                        uiWrappers.wrapInTitle( "chartTitle", chart, "Graph" )
                    ]
                },
            ]
        });
    }

    // webix jet init event
    $oninit = () => {
        let calendar = $$( "attendanceCalendar" ) as webix.ui.calendar,
            datatable = $$( "attendanceDatatable" ) as webix.ui.datatable,
            schedulePrint = $$( "schedulePrint" ) as webix.ui.button;
        
        //schedulePrint.attachEvent( "onItemClick", () => { this.print() } );

        // Events
        calendar.attachEvent( "onDateSelect", ( date: Date ) => {
            let datatable = $$( "attendanceDatatable" ) as webix.ui.datatable;
            this.requestData( date );
        });

        datatable.attachEvent( "onAfterEditStop", () => {
            this.updateFromTable();
        });


        // ipcRenderer Events
        ipcRenderer.send( "get-week-settings" );
        ipcRenderer.on( "get-week-settings-reply", ( event, arg ) => {
            this.hours = arg;
        });
        ipcRenderer.on( "get-attendance-data-reply", ( event, arg ) => { this.parseData( arg ) } );

        // Disabled by default (no selection on start)
        this.disable( true );
    }

    // Request data from database
    requestData( dateObject: Date ): void {
        let datatable = $$( "attendanceDatatable" ) as webix.ui.datatable;

        datatable.clearAll();

        // Get week date range from selected date
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

    // Parse data recieved from database via this.requestData()
    parseData( data: { weekrows: any[], dayrows: any[] } ): void {
        let datatable = $$( "attendanceDatatable" ) as webix.ui.datatable;

        // Week data handling (unused data for now)
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
        
        // Add existing data to 'visits' and get min/max dates
        // 'visits' is like { "the hour number": "the visits number" }
        // Get min and max in case user set up new open hours
        for ( let r of data.dayrows ) {
            visits[ r.hour.toString() ] = r.visits;
            if ( r.hour > max ) max = r.hour;
            if ( r.hour < min ) min = r.hour;
        }

        // Final data type
        let visitsPerHour: AttendanceDatatable[] = [];

        // Parse 'visits' and fill data array
        // Fill hours from 'min' to 'max'
        // insert 'null' into hours without values in 'visits'
        if ( hours.open === 1 || visits.length > 0 ) {
            for ( let h = min; h <= max; h ++ ) {
                visitsPerHour.push({
                    id: h,
                    hour: this.hourString( h ),
                    visits: visits[ h.toString() ] === undefined ? null : visits[ h.toString() ]
                })
            }
            this.disable( false ); // Enable the ui (there is data to display)
        } else this.disable( true ); // Disable the ui (no data)

        // Set and update everything
        this.data.day.visitsPerHour = visitsPerHour;
        datatable.parse( this.data.day.visitsPerHour, "json" );
        datatable.refresh();
        this.updateTotals();
        this.updateCharts();
        this.updateCards();
    }

    // Update data from table (fired when user changed value in cell)
    updateFromTable(): void {
        let datatable = $$( "attendanceDatatable" ) as webix.ui.datatable;

        // Get all data at once
        // This is alright, since hour ranges are short
        // But, maybe consider a better way later using async loading
        // Too bad the datatable event doesn't specify the edited cell
        this.data.day.visitsPerHour = datatable.serialize();

        // Send new data to database
        // Again, it's ok, but could be asynced
        ipcRenderer.send( "update-attendance-data", {
            date: this.selectedDate.format( "YYYY-MM-DD" ),
            data: this.data.day.visitsPerHour
        });

        this.updateTotals();
        this.updateCharts();
        this.updateCards();
    }

    // Update the totals in this.data (updating day data only so far)
    updateTotals(): void {
        this.data.day.visitsTotal = 0;
        this.data.day.visitsPeak = 0;
        for ( let d of this.data.day.visitsPerHour ) {
            if ( d.visits > this.data.day.visitsPeak ) this.data.day.visitsPeak = d.visits;
            this.data.day.visitsTotal += d.visits;
        }
    }

    // Update the charts
    updateCharts(): void {
        let attendanceDayChart = $$( "attendanceDayChart" ) as webix.ui.chart,
            datatable = $$( "attendanceDatatable" ) as webix.ui.datatable;
        
        attendanceDayChart.clearAll();

        // Redefine 'y' range to fit the data
        // 'x' range gets reconfigured automatically
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

    // Update data cards
    updateCards(): void {
        let hours = this.hours[ this.selectedDate.day() ],
            desc  = "";
        
        // Decide whether to display hours or the "Closed" message
        if ( hours.open === 1 ) {
            desc = "Open from " + this.hourString( hours.startHour, hours.startMinute )
                + " until " + this.hourString( hours.endHour, hours.endMinute )
        } else desc = `Closed on ${this.selectedDate.format( "dddd" )}s.`

        // Update cards
        this.HoursInfoCard.setData({
            title: this.selectedDate.format( "DD MMMM YYYY" ),
            desc: desc,
            subtext: `You can set opeining/closing dates in the settings.`
        })

        this.GeneralInfoCard.setData({
            title: this.data.day.visitsTotal.toString()
        })
    }

    // Print the data (unused for now)
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

    // Format hour and minute numbers into HH:MM AM/PM format string
    hourString( hour: number, minute?: number ): string {
        minute = minute === undefined ? 0 : minute;
        return moment( `${ hour }:${ minute }`, "HH:mm" ).format( "hh:mm A" );
    }

    // Disable or enable some parts of the ui
    disable( disable: boolean ) {
        const things = [ $$( "datatableTitle" ), $$( "GeneralInfoCardTitle" ), $$( "chartTitle" ) ]

        if ( disable ) for ( let t of things ) t.disable();
        else for ( let t of things ) t.enable();
    }
}