// Main schedules view

import uiWrappers = require( "models/uiWrappers" );
import WeeklyScheduler = require( "models/WeeklyScheduler" );
import EventForm = require( "models/EventForm" );

export = new class {
    $ui: any; // Webix jet ui

    // FullCalendar scheduler (see 'models/WeeklyScheduler')
    scheduler: WeeklyScheduler = new WeeklyScheduler( "scheduler" );
    
    // Webix form for setting event data (see 'models/WeeklyScheduler')
    // Used twice, so its it's own class
    form: EventForm = new EventForm( "SE" ); // Form for editing currently selected event
    popupForm: EventForm = new EventForm( "SEP" ); // Form for 'Add' popup
    
    selectedItem: any = null; // Currently selected item

    constructor() {
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
            body: this.popupForm
        }

        // 'Add Event' and 'Delete Event' buttons
        const buttons = [
            { view:"button", id:"addEvent", type: "form", align:"left", label: "Add Event", autowidth: true, popup: "popupEventForm" },
            { view:"button", id:"deleteEvent", type: "danger", align:"left", label: "Delete Event", autowidth: true }
        ]

        // 'Add' and 'Delete' Schedule buttons
        const listButtons = [
            { view:"button", id:"addSchedule", type: "form", align:"left", label: "Add", autowidth: true },
            { view:"button", id:"deleteSchedule", type: "danger", align:"left", label: "Delete", autowidth: true }
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
                            uiWrappers.wrapInTitle( "EventEditorTitle", this.form, "Event Editor" )
                        ]
                    },
                    uiWrappers.wrapInTitle( "CalendarTitle", scheduler, "Outlook", buttons )
                ]
            }
        )

        webix.ui( popup );

        // Form submit callbacks
        this.popupForm.init( ( newEvent: FC.EventObject ) => {
            this.scheduler.addEvent( newEvent );
            this.popupForm.hide();
        });

        this.form.init( ( newEvent ) => {
            console.log( "sending to scheduler" );
            this.scheduler.submitChange( newEvent )
        });


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

            console.log( "ready to pass ", event );

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
            scheduleName         = $$( "scheduleName" ) as webix.ui.text,
            list                 = $$( "scheduleList" ) as webix.ui.list;
        
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

        list.attachEvent( "onSelectChange", () => {
            this.updateFormValues( list.getSelectedItem( false ) );
            
        });

        scheduleName.attachEvent( "onTimedKeyPress", () => {
            this.updateScheduleName()
        })

        
        // Initiate evet editor forms
        this.form.initUi();
        this.popupForm.initUi();

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

        // Disabled by default (no schedule sected at start)
        this.disable( true );
    }

    // Webix destroy event
    $ondestroy = () => {
        // Remove ipc listeners to avoid repeats
        // Because of interaction with other classes
        ipcRenderer.removeAllListeners( "get-schedule-names-reply" );
        ipcRenderer.removeAllListeners( "get-schedule-events-reply" );
        this.selectedItem = null;
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
        console.log( obj );
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

    // Disable or enable editor parts of the ui
    disable( disable: boolean ): void {
        const things = [
            $$( "EventEditorTitle" ), $$( "CalendarTitle" ), $$( "scheduleName" )
        ]

        if ( disable ) for ( let t of things ) t.disable();
        else for ( let t of things ) t.enable();

    }

}