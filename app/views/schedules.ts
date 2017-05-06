import uiWrappers = require( "models/uiWrappers" );
import WeeklyScheduler = require( "models/WeeklyScheduler" );
import EventForm = require( "models/EventForm" );

export = new class {
    $ui: any;

    scheduler: WeeklyScheduler;
    form: EventForm;
    popupForm: EventForm;

    constructor() {
        const calendar: webix.ui.templateConfig = {
            view: "template",
            template: "<div id='scheduler'></div>",
            id: "scheduler-webix"
        }

        const list: webix.ui.datatableConfig = {
            view:"datatable",
            select: true,
            autowidth: true,
            columns: [
                {
                    id:"name",
                    header:[ {content:"textFilter"} ],
                    width: 300
                }
            ],
            data: [
                { name: "Janitor" },
                { name: "Boss" }
            ]
        }
        
        this.form = new EventForm( "SE" ); // ScheduleEvent
        this.popupForm = new EventForm( "SEP" ); // SchedueEventPopup

        const popup = {
            view: "popup",
            id: "popupEventForm",
            head: "Create New Event",
            autofit: true,
            body: this.popupForm
        }

        const buttons = [
            { view:"button", id:"addEvent", type: "form", align:"left", label: "Add Event", autowidth: true, popup: "popupEventForm" },
            { view:"button", id:"deleteEvent", type: "danger", align:"left", label: "Delete Event", autowidth: true }
        ]

        this.$ui = uiWrappers.wrapInLayout( {
                cols: [
                    {
                        margin: 10,
                        rows: [
                            uiWrappers.wrapInTitle( list, "Schedules"    ),
                            uiWrappers.wrapInTitle( this.form, "Event Editor" )
                        ]
                    },
                    uiWrappers.wrapInTitle( calendar, "Outlook", buttons )
                ]
            }
        )

        webix.ui( popup );

    }

    $oninit = () => {
        const calendarElement = $( "#scheduler" );        
        
        // Ignore these laters for now, they're lying
        if ( calendarElement.length <= 0 ) {
            ( $$( "scheduler-webix" ) as any ).attachEvent( "onAfterRender", this.createScheduler );
        } else this.createScheduler()

        /*$$( "addEvent" ).attachEvent( "onItemClick", () => {
            this.scheduler.addEvent( {
                title: "TestEvent",
                start: moment( new Date( 2000, 1, 1, 10 ) ),
                end: moment( new Date( 2000, 1, 1, 11 ) )
            } as FC.EventObject )
        } );*/

        this.form.init( ( newEvent ) => {
            console.log( "sending to scheduler" );
            this.scheduler.submitChange( newEvent )
        });

        this.popupForm.init( ( newEvent: FC.EventObject ) => {
            this.scheduler.addEvent( newEvent );
        });

        this.popupForm.update( {
            title: "",
            start: moment( new Date( 2000, 1, 1, 10 ) ),
            end: moment( new Date( 2000, 1, 1, 11 ) )
        } as FC.EventObject )

    }

    $ondestroy = () => {
        //this.scheduler.destroy();
    }

    createScheduler(): void {
        this.scheduler = new WeeklyScheduler( "scheduler" );
        this.scheduler.eventDataCallback = ( event: FC.EventObject ) => {
            this.form.update( event );
        }
    }

}