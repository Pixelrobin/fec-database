// Main schedules view

import uiWrappers = require( "models/uiWrappers" );
import WeeklyScheduler = require( "models/WeeklyScheduler" );
import { EventFormHandler, createEventFormUI } from "models/EventForm"

declare const ipcRenderer: Electron.IpcRenderer;

export = new class {
    $ui: any; // Webix jet ui

    // FullCalendar scheduler (see 'models/WeeklyScheduler')
    scheduler: WeeklyScheduler = new WeeklyScheduler( "scheduler" );
    
    // Webix form for setting event data (see 'models/WeeklyScheduler')
    // Used twice, so its it's own class
    form: EventFormHandler; // Form for editing currently selected event
    popupForm: EventFormHandler; // Form for 'Add' popup
    
    selectedItem: any = null; // Currently selected item

    constructor() {
        // Forms
        const formUI = createEventFormUI( "SE" );
        const popupFormUI = createEventFormUI( "SEP" );
        
        // Scheduler ui
        const scheduler: webix.ui.templateConfig = {
            view: "template",
            template: "<div id='scheduler'></div>",
            id: "scheduler-webix"
        }

        // list for selecting schedule
        // Disabled search because of conflicts with selction
        // Also because of bad user expirience
        // Basically, searching deselects the item in list
        const list: webix.ui.datatableConfig = {
            view:"datatable",
            id: "scheduleList",
            select: true,
            autowidth: true,
            columns: [
                {
                    id:"name",
                    header: "Name",//[ {content:"textFilter"} ],
                    width: 300
                }
            ],
            data: []
        }

        // Popup for adding an event
        const popup = {
            view: "popup",
            id: "popupEventForm",
            head: "Create New Event",
            height: 400,
            body: popupFormUI
        }

        // 'Add Event' and 'Delete Event' buttons
        const buttons = [
            { view:"button", id:"addEvent", type: "form", align:"left", label: "Add Event", autowidth: true, popup: "popupEventForm" },
            { view:"button", id:"deleteEvent", type: "danger", align:"left", label: "Delete Event", autowidth: true },
        ]

        // 'Add' and 'Delete' Schedule buttons
        const listButtons = [
            { view:"button", id:"addSchedule", type: "form", align:"left", label: "Add", autowidth: true },
            { view:"button", id:"deleteSchedule", type: "danger", align:"left", label: "Delete", autowidth: true },
            { view:"button", id:"printSchedule", type: "form", align:"left", label: "Print", autowidth: true }
        ]

        // Schedule name editor form
        const scheduleName = {
            view: "text",
            id: "scheduleName",
            keyPressTimeout: 500,
            label: "Schedule Name",
            labelPosition: "top"
        }

        this.$ui = uiWrappers.wrapInLayout( {
                cols: [
                    {
                        margin: 10,
                        rows: [
                            uiWrappers.wrapInTitle( "listTitle", {
                                rows: [
                                    list,
                                    scheduleName
                                ]
                            }, "Schedules", listButtons ),
                            uiWrappers.wrapInTitle( "EventEditorTitle", formUI, "Event Editor" )
                        ]
                    },
                    uiWrappers.wrapInTitle( "CalendarTitle", scheduler, "Outlook", buttons )
                ]
            }
        )

        webix.ui( popup );

        /*
        // Form submit callbacks
        this.popupForm.init( ( newEvent: FC.EventObject ) => {
            this.scheduler.addEvent( newEvent );
            this.popupForm.hide();
        });

        this.form.init( ( newEvent ) => {
            this.scheduler.submitChange( newEvent )
        });*/

        // Scheduler callbacks
        this.scheduler.eventDataCallback = ( data: any ) => {            
            if ( !data.skipForm ) this.form.update( data.event );
            
            let event = {
                $eventId: data.event.eventId,
                $scheduleId: this.selectedItem.id,
                $title: data.event.title,
                $startTime: data.event.start.format( "HH:mm" ),
                $endTime: data.event.end.format( "HH:mm" ),
                $day: data.event.start.day()
            }

            ipcRenderer.send( "submit-event", event );
        }

        this.scheduler.eventDestroyCallback = ( eventId: string) => {            
            ipcRenderer.send( "delete-event", eventId );
        }

    }

    // Webix init event
    $oninit = () => {
        const calendarElement    = $( "#scheduler" ),
            addEventButton       = $$( "addEvent" ) as webix.ui.button,
            deleteEventButton    = $$( "deleteEvent" ) as webix.ui.button,
            addScheduleButton    = $$( "addSchedule" ) as webix.ui.button,
            deleteScheduleButton = $$( "deleteSchedule" ) as webix.ui.button,
            printScheduleButton  = $$( "printSchedule" ) as webix.ui.button,
            scheduleName         = $$( "scheduleName" ) as webix.ui.text,
            list                 = $$( "scheduleList" ) as webix.ui.list;

        // Create form handlers
        this.form = new EventFormHandler( "SE", ( newEvent: FC.EventObject ) => {
            this.scheduler.submitChange( newEvent );
        });
        this.popupForm = new EventFormHandler( "SEP", ( newEvent: FC.EventObject ) => {
            this.scheduler.addEvent( newEvent );
            this.popupForm.hide();
        });
        
        // Render the scheduler (FullCalendar) component
        // But check if the element exists yet
        if ( calendarElement.length <= 0 ) {
            ( $$( "scheduler-webix" ) as any ).attachEvent( "onAfterRender", () => { this.createScheduler() } );
        } else this.createScheduler()
        
        // Events
        addEventButton.attachEvent( "onItemClick", () => { this.popupForm.focus() } );
        deleteEventButton.attachEvent( "onItemClick", () => { this.scheduler.deleteEvent(); });
        addScheduleButton.attachEvent( "onItemClick", () => { this.addSchedule() } );
        deleteScheduleButton.attachEvent( "onItemClick", () => { this.deleteSelectedSchedule() } );
        printScheduleButton.attachEvent( "onItemClick", () => { this.print() } );

        list.attachEvent( "onSelectChange", () => {
            this.updateFormValues( list.getSelectedItem( false ) );
        });

        scheduleName.attachEvent( "onTimedKeyPress", () => {
            this.updateScheduleName()
        })

        
        // Initiate event editor forms
        //this.form.initUi();
        //this.popupForm.initUi();

        this.popupForm.update( {
            title: "",
            start: moment( new Date( 2006, 0, 1, 10 ) ),
            end: moment( new Date( 2006, 0, 1, 11 ) )
        } as FC.EventObject )


        // ipc Events
        ipcRenderer.send( "get-schedule-names" );
        ipcRenderer.on( "get-schedule-names-reply", ( event, arg ) => {
            this.parseData( arg );
        });

        ipcRenderer.on( "get-schedule-events-reply", ( event, arg ) => {
            this.parseEvents( arg );
        })

        // Disabled by default (no schedule selected at start)
        this.disable( true );
    }

    // Webix destroy event
    $ondestroy = () => {
        // Remove ipc listeners to avoid repeats
        // Because of interaction with other classes
        ipcRenderer.removeAllListeners( "get-schedule-names-reply" );
        ipcRenderer.removeAllListeners( "get-schedule-events-reply" );
        this.selectedItem = null;
        this.form.eventChangeCallback = null;
        this.popupForm.eventChangeCallback = null;
        delete this.form;
        delete this.popupForm;
    }

    // Parse data (schedule names only)
    parseData( data: any ): void {
        let list = $$( "scheduleList" ) as webix.ui.list;

        list.parse( data, "json" )
    }

    // Parse events in schedule
    parseEvents( data: any[] ): void {
        let c = (d) => { return moment( d + ":2006:01:01", "HH:mm:YYYY:MM:DD" ) },
        events = []
        
        // Add event via 'this.scheduler'
        // Second argument 'true' to avoid data update callback
        for ( let e of data ) {
            this.scheduler.addEvent({
                title: e.title,
                eventId: e.eventId,
                start: c( e.startTime ).day( e.day ),
                end: c( e.endTime ).day( e.day )
            }, true );
        }
    }

    // Create scheduler component
    createScheduler(): void {
        this.scheduler.init();
        ( $$( "scheduler-webix" ) as any ).attachEvent( "onDestruct", () => {
            this.scheduler.destroy();
        } )
    }

    // Add schedule to database
    addSchedule(): void {
        ipcRenderer.send( "add-schedule", "New Schedule" );
    }

    // Delete currently selected schedule and notify database
    deleteSelectedSchedule(): void {
        const list = $$( "scheduleList" ) as webix.ui.datatable,
            selectedItem = list.getSelectedItem( false );

        if ( selectedItem ) {
            if ( selectedItem.id ) {
                ipcRenderer.send( "delete-schedule", selectedItem.id );
                list.remove( list.getSelectedId( false, true ) as string );
                this.selectedItem = null; // To avoid errors
                this.scheduler.clear();
            }
        }

        list.clearSelection();
        list.refresh();
    }

    // Update schedule name in database
    updateScheduleName(): void {
        let id = this.selectedItem.id;
        
        // Update 'this.selectedItem' too
        this.selectedItem = {
            id: id,
            name: ( $$( "scheduleName" ) as webix.ui.text ).getValue(),
        }
        
        ipcRenderer.send( "set-schedule-name", this.selectedItem );
    }

    // Update schedule name textbox and disable ui if needed
    // Also, get the events for a particular schedule from the database
    updateFormValues( obj: any ): void {
        if ( obj ) {
            if ( !this.selectedItem || obj.id !== this.selectedItem.id ) {
                if ( obj ) {
                    this.disable( false );
                    ( $$( "scheduleName" ) as webix.ui.text ).setValue( obj.name );
                } else this.disable( true );

                if ( this.selectedItem ) this.scheduler.clear();
                this.selectedItem = obj;

                // Get events from database
                ipcRenderer.send( "get-schedule-events", this.selectedItem.id );
            }
        } else this.disable( true );
    }

    // Prints the currently selected schedule
    // This is a lot more complex then I'd though it'd be
    print(): void {
        const eventData = this.scheduler.getAllEvents(),
            // It's faster to declare weekdays like this instead of using moment()
            weekdays = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ]
            
        let eventsByWeek = [], // Events sorted by day of week
            rows = [],         // Table element grid
            row = 0,           // Used for making grids
            column = 0;        // Used for making grids
        
        // Sort the events into their respectable weekdays
        for ( let e of eventData ) {
            // e.start and e.end are moment() instances
            const day = e.start.day();
            
            // Create the secondary array if it doesn't exist
            if ( eventsByWeek[ day ] === undefined )
                eventsByWeek[ day ] = [];
            
            // Push the table data into the event
            eventsByWeek[ day ].push({
                title: e.title,
                start: e.start.format( "hh:mm A" ),
                end: e.end.format( "hh:mm A" )
            });
        }

        // Add the tables per week
        for ( let w in eventsByWeek ) {

            // Make sure there are events in that weekday
            // If there are not, we don't render them
            if ( eventsByWeek[ w ] !== undefined ) {
                // Sort the events in a day by their times using
                // moment() functions
                eventsByWeek[ w ].sort( ( a, b ) => {
                    // Any because switching from boolean to number
                    let check: any = moment( b ).isAfter( moment( a ) );
                    check = check === 0 ? -1 : check;
                    return check;
                })

                // If the current row array is undefined, create it.
                if ( rows[ row ] == undefined ) rows[ row ] = [];

                // Insert a new column into the row
                rows[ row ][ column ] = [
                    {
                        type: "header",
                        headerSize: 6,
                        headerText: weekdays[ w ]
                    },
                    {
                        type: "table",
                        tableCols: [
                            { id: "title", header: "Event" },
                            { id: "start", header: "Start Time" },
                            { id: "end", header: "End Time" }
                        ],
                        tableData: []
                    }
                ]

                // Fill the column with that day's data
                for ( let e of eventsByWeek[ w ] ) {
                    rows[ row ][ column ][ 1 ].tableData.push( e );
                }

                // Allow only a max of 3 columns per row
                column ++;
                if ( column === 3 ) {
                    column = 0;
                    row ++;
                }
            }
        }

        // Make the final element data
        let data: RenderElement[] = [
            {
                type: "header",
                headerSize: 4,
                headerText: `Schedule Report: ${ this.selectedItem.name }`
            }
        ]

        // Fill it with the rows
        for ( let r in rows ) {
            data.push({
                type: "multicolumn",
                columns: rows[ r ]
            })
        }

        // Print it
        ipcRenderer.send( "print", {
            elements: data,
            filename: `${ this.selectedItem.name }.pdf`
        });

    }

    // Disable or enable editor parts of the ui
    disable( disable: boolean ): void {
        const things = [
            $$( "EventEditorTitle" ), $$( "CalendarTitle" ),
            $$( "scheduleName" ), $$( "printSchedule" )
        ]

        if ( disable ) for ( let t of things ) t.disable();
        else for ( let t of things ) t.enable();

    }

}