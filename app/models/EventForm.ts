// Event data setting form for scheduler
// TODO: Add support for repeating events

// Form input interface
interface EventFormInputs {
    name:   webix.ui.text,
    start:  webix.ui.datepicker,
    end:    webix.ui.datepicker,
    day:    webix.ui.richselect,
    submit: webix.ui.button,
}

class EventForm implements webix.ui.formConfig {
    // Webix component configs
    view = "form";
    autoheight = false;
    elements = null;
    id: string;
    formInputs: EventFormInputs;

    event: FC.EventObject; // Event to edit
    eventChangeCallback: Function = null; // Callback on event submit

    // Used to stop events from submitting themselves
    // to the database when being loaded from it.
    skipChanges: boolean = false;

    constructor( id: string ) {
        // Form elements
        this.elements = [
            { view: "text", id: id + "Name", placeholder: "Event Name", label: "Event Name", labelPosition: "top"  },
            { cols: [
                { view: "datepicker", id: id + "Start", type:"time", stringResult:true, label: "Start Time", labelPosition: "top" },
                { view: "datepicker", id: id + "End", type:"time", stringResult:true, label: "End Time", labelPosition: "top" }
            ]},
            //{ view:"checkbox", id: id + "Repeted", label: "Recurring event", value: 1 }
            { view: "richselect", id: id + "Day", label: "Day of Week", labelPosition: "top", value: "Sunday", yCount: "7", options: [
                { id: 1, value: "Sunday" },
                { id: 2, value: "Monday" },
                { id: 3, value: "Tuesday" },
                { id: 4, value: "Wednesday" },
                { id: 5, value: "Thursday" },
                { id: 6, value: "Friday" },
                { id: 7, value: "Saturday" }
            ]},
            /*{ view: "list", autoheight: true, select: true, multiselect: true, template: "#value#", data: [
                { id: 0, value: "Sunday" },
                { id: 1, value: "Monday" },
                { id: 2, value: "Tuesday" },
                { id: 3, value: "Wednesday" },
                { id: 4, value: "Thursday" },
                { id: 5, value: "Friday" },
                { id: 6, value: "Saturday" }
            ]
            },*/
            { view:"button", id: id + "Submit", value:"Submit", type: "form" }
            /*{ cols: [
                { view:"button", id: id + "Submit", value:"Submit", type: "form" },
                { view:"button", id: id + "Cancel", value:"Cancel" }
            ]}*/
        ]

        this.id = id;
    }

    // Initiate the form (just callback for now)
    init( eventChangeCallback: Function ): void {
        this.eventChangeCallback = eventChangeCallback;
    }

    // Initiate the ui references (called once ui is loaded, unline init())
    initUi(): void {
        // Fill 'this.FormInputs' with components
        this.formInputs = {
            name:   ( $$( this.id + "Name"   ) as webix.ui.text       ),
            start:  ( $$( this.id + "Start"  ) as webix.ui.datepicker ),
            end:    ( $$( this.id + "End"    ) as webix.ui.datepicker ),
            day:    ( $$( this.id + "Day"    ) as webix.ui.richselect ),
            submit: ( $$( this.id + "Submit" ) as webix.ui.button     ),
        }

        // 'Submit' button press events
        this.formInputs.submit.attachEvent( "onItemClick", () => { this.submitChanges() } )
    }

    // Update the form with new event data
    update( newEvent: FC.EventObject ) {
        this.event = newEvent;
        this.skipChanges = true;
        this.formInputs.name.setValue( newEvent.title );
        this.formInputs.start.setValue( this.momentToWebixString( newEvent.start ) );
        this.formInputs.end.setValue( this.momentToWebixString( newEvent.end ) );
        this.formInputs.day.setValue( newEvent.start.day() + 1 );
        this.skipChanges = false;
    }

    // Submit the changes in the form via the callback function
    submitChanges(): void {
        const validated = (
            this.webixStringToMoment(
                ( $$( this.id + "End" ) as any ).getValue()
            )
            
            .isAfter( this.webixStringToMoment(
                ( $$( this.id + "Start" ) as any ).getValue() )
            )
        )

        if ( validated === true ) {
            this.event.title = this.formInputs.name.getValue()
            
            this.event.start = this.webixStringToMoment(
                this.formInputs.start.getValue() ).day( ( this.formInputs.day.getValue() as any ) - 1
            );
            
            this.event.end = this.webixStringToMoment(
                this.formInputs.end.getValue() ).day( ( this.formInputs.day.getValue() as any ) - 1
            );
            
            ( this.event as any ).eventId = null;

            console.log( this.event );
            if ( this.eventChangeCallback !== null ) {
                this.eventChangeCallback( this.event );
            }
        } else {
            webix.message({
                type: "error",
                text: "Invalid date range."
            })
        }
    }

    /*updateFormValue( property: string, value: any ): void {
        if ( !this.skipChanges ) {
            this.event[ property ] = value;
            this.submitChange();
        }
    }*/

    // Convert webix time element return string to 'moment'
    webixStringToMoment( date: string ): any {
        return moment( date + ":2006:01:01", "HH:mm:YYYY:MM:DD" );
    }

    // Convert moment to webix time element string
    momentToWebixString( date: any ): string {
        return date.format( "HH:mm" )
    }

    // Hide the form
    hide(): void {
        $$( this.id ).hide();
    }

    // Focus on the name element
    focus(): void {
        ( $$( this.id + "Name" ) as webix.ui.text) .focus();
    }

}

export = EventForm;