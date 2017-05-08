import uiWrappers = require( "models/uiWrappers" );
import WeeklyScheduler = require( "models/WeeklyScheduler" );
import EventForm = require( "models/EventForm" );

export = new class {
    $ui: any;

    scheduler: WeeklyScheduler = new WeeklyScheduler( "scheduler" );
    form: EventForm = new EventForm( "SE" );
    popupForm: EventForm = new EventForm( "SEP" );
    selectedItem: any = null;

    constructor() {
        const calendar: webix.ui.templateConfig = {
            view: "template",
            template: "<div id='scheduler'></div>",
            id: "scheduler-webix"
        }

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

        const popup = {
            view: "popup",
            id: "popupEventForm",
            head: "Create New Event",
            height: 400,
            body: this.popupForm
        }

        const buttons = [
            { view:"button", id:"addEvent", type: "form", align:"left", label: "Add Event", autowidth: true, popup: "popupEventForm" },
            { view:"button", id:"deleteEvent", type: "danger", align:"left", label: "Delete Event", autowidth: true }
        ]

        const listButtons = [
            { view:"button", id:"addSchedule", type: "form", align:"left", label: "Add", autowidth: true },
            { view:"button", id:"deleteSchedule", type: "danger", align:"left", label: "Delete", autowidth: true }
        ]

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
                    uiWrappers.wrapInTitle( "CalendarTitle", calendar, "Outlook", buttons )
                ]
            }
        )

        webix.ui( popup );

        this.popupForm.init( ( newEvent: FC.EventObject ) => {
            this.scheduler.addEvent( newEvent );
            this.popupForm.hide();
        });

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

    $oninit = () => {
        const calendarElement = $( "#scheduler" ),
            addEventButton = $$( "addEvent" ) as webix.ui.button,
            deleteEventButton = $$( "deleteEvent" ) as webix.ui.button,
            addScheduleButton = $$( "addSchedule" ) as webix.ui.button,
            deleteScheduleButton = $$( "deleteSchedule" ) as webix.ui.button,
            scheduleName = $$( "scheduleName" ) as webix.ui.text,
            list = $$( "scheduleList" ) as webix.ui.list;
        
        // Ignore these laters for now, they're lying
        if ( calendarElement.length <= 0 ) {
            ( $$( "scheduler-webix" ) as any ).attachEvent( "onAfterRender", () => { this.createScheduler() } );
        } else this.createScheduler()
        
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

        this.form.init( ( newEvent ) => {
            console.log( "sending to scheduler" );
            this.scheduler.submitChange( newEvent )
        });

        this.popupForm.update( {
            title: "",
            start: moment( new Date( 2006, 0, 1, 10 ) ),
            end: moment( new Date( 2006, 0, 1, 11 ) )
        } as FC.EventObject )

        ipcRenderer.send( "get-schedule-names" );
        ipcRenderer.on( "get-schedule-names-reply", ( event, arg ) => {
            this.parseData( arg );
        });

        ipcRenderer.on( "get-schedule-events-reply", ( event, arg ) => {
            this.parseEvents( arg );
        })

        this.disable( true );
    }

    $ondestroy = () => {
        //this.scheduler.destroy();
        //$$( "popupEventForm" ).destructor();
        ipcRenderer.removeAllListeners( "get-schedule-names-reply" );
        ipcRenderer.removeAllListeners( "get-schedule-events-reply" );
        this.selectedItem = null;
    }

    parseData( data: any ): void {
        let list = $$( "scheduleList" ) as webix.ui.list;
        console.log( "parsing data" );

        list.parse( data, "json" )
    }

    parseEvents( data: any[] ): void {
        let c = (d) => { return moment( d + ":2006:01:01", "HH:mm:YYYY:MM:DD" ) };
        let events = []

        console.log( "eventdata", data )
        
        for ( let e of data ) {
            console.log( e.eventId );
            this.scheduler.addEvent({
                title: e.title,
                eventId: e.eventId,
                start: c( e.startTime ).day( e.day ),
                end: c( e.endTime ).day( e.day )
            }, true );
        }

        //this.scheduler.addEventSource( events );
    }

    createScheduler(): void {
        this.scheduler.init();
        

        $$( "scheduler-webix" ).attachEvent( "onDestruct", () => {
            console.log( "DESTRUCTION TO SCHDULER");
            this.scheduler.destroy();
            //delete this.scheduler;
        } )
    }

    addSchedule(): void {
        ipcRenderer.send( "add-schedule", "New Schedule" );
    }

    deleteSelectedSchedule(): void {
        const list = $$( "scheduleList" ) as webix.ui.datatable;
        let selectedItem = list.getSelectedItem( false );

        if ( selectedItem ) {
            if ( selectedItem.id ) {
                ipcRenderer.send( "delete-schedule", selectedItem.id );
                list.remove( list.getSelectedId( false, true ) as string );
                this.selectedItem = null;
                this.scheduler.clear();
            }
        }

        list.clearSelection();
        list.refresh();
    }

    updateScheduleName(): void {
        let id = this.selectedItem.id;
        console.log( "update name");
        
        this.selectedItem = {
            id: id,
            name: ( $$( "scheduleName" ) as webix.ui.text ).getValue(),
        }
        
        ipcRenderer.send( "set-schedule-name", this.selectedItem );
    }

    updateFormValues( obj: any ): void {
        console.log( obj );
        if ( obj ) {
            if ( !this.selectedItem || obj.id !== this.selectedItem.id ) {
                if ( obj ) {
                    //obj = { name: "" }
                    this.disable( false );
                    ( $$( "scheduleName" ) as webix.ui.text ).setValue( obj.name );
                } else {
                    this.disable( true );
                }

                if ( this.selectedItem ) this.scheduler.clear();
                this.selectedItem = obj;
                ipcRenderer.send( "get-schedule-events", this.selectedItem.id );
            }
        } else this.disable( true );
    }

    disable( disable: boolean ): void {
        const things = [
            $$( "EventEditorTitle" ), $$( "CalendarTitle" ), $$( "scheduleName" )
        ]

        if ( disable ) for ( let t of things ) t.disable();
        else for ( let t of things ) t.enable();

    }

}