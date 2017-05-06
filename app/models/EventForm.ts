interface EventFormInputs {
    name:   webix.ui.text,
    start:  webix.ui.datepicker,
    end:    webix.ui.datepicker,
    day:    webix.ui.richselect,
    submit: webix.ui.button,
    cancel: webix.ui.button
}

class EventForm implements webix.ui.formConfig {
    view = "form";
    autoheight = false;
    elements = null;
    
    formid: string; // TODO: Change to formId
    formInputs: EventFormInputs;

    event: FC.EventObject;
    eventChangeCallback: Function = null;

    skipChanges: boolean = false;

    constructor( id: string ) {
        this.elements = [
            { view: "text", id: id + "Name", placeholder: "Ex. Putlock lunch", label: "Event Name", labelPosition: "top"  },
            { cols: [
                { view: "datepicker", id: id + "Start", type:"time", stringResult:true, label: "Start Time", labelPosition: "top" },
                { view: "datepicker", id: id + "End", type:"time", stringResult:true, label: "End Time", labelPosition: "top" }
            ]},
            //{ view:"checkbox", id: id + "Repeted", label: "Recurring event", value: 1 }
            { view: "richselect", id: id + "Day", label: "Day of Week", labelPosition: "top", value: 0, yCount: "7", options: [
                { id: 0, value: "Sunday" },
                { id: 1, value: "Monday" },
                { id: 2, value: "Tuesday" },
                { id: 3, value: "Wednesday" },
                { id: 4, value: "Thursday" },
                { id: 5, value: "Friday" },
                { id: 6, value: "Saturday" }
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

        this.formid = id;
    }

    init( eventChangeCallback: Function ): void {
        this.formInputs = {
            name:   ( $$( this.formid + "Name"   ) as webix.ui.text       ),
            start:  ( $$( this.formid + "Start"  ) as webix.ui.datepicker ),
            end:    ( $$( this.formid + "End"    ) as webix.ui.datepicker ),
            day:    ( $$( this.formid + "Day"    ) as webix.ui.richselect ),
            submit: ( $$( this.formid + "Submit" ) as webix.ui.button     ),
            cancel: ( $$( this.formid + "cancel" ) as webix.ui.button     )
        }

        this.formInputs.submit.attachEvent( "onItemClick", () => { this.submitChanges() } )
        
        this.eventChangeCallback = eventChangeCallback;
    }

    update( newEvent: FC.EventObject ) {
        this.event = newEvent;
        this.skipChanges = true;
        this.formInputs.name.setValue( newEvent.title );
        this.formInputs.start.setValue( this.momentToWebixString( newEvent.start ) );
        this.formInputs.end.setValue( this.momentToWebixString( newEvent.end ) );
        this.formInputs.day.setValue( newEvent.start.day() );
        this.skipChanges = false;
        console.log( newEvent.start.day() );
    }

    submitChanges(): void {
        const validated = (
            this.webixStringToMoment( $$( this.formid + "End" ).getValue() )
            .isAfter( this.webixStringToMoment( $$( this.formid + "Start" ).getValue() ) )
        )

        console.log( validated );

        if ( validated === true ) {
            this.event.title = this.formInputs.name.getValue()
            this.event.start = this.webixStringToMoment( this.formInputs.start.getValue() ).day( this.formInputs.day )
            this.event.end   = this.webixStringToMoment( this.formInputs.end.getValue() ).day( this.formInputs.day )

            if ( this.eventChangeCallback !== null ) {
                this.eventChangeCallback( this.event );
            }
        } else {

        }
    }

    /*updateFormValue( property: string, value: any ): void {
        if ( !this.skipChanges ) {
            this.event[ property ] = value;
            this.submitChange();
        }
    }*/

    webixStringToMoment( date: string ): moment {
        let jsDate: Date = webix.i18n.timeFormatDate( date );
        jsDate.setFullYear( 2000, 1, 1 );
        return moment( jsDate );
    }

    momentToWebixString( date: moment ): string {
        return date.format( "HH:mm" )
    }


}

export = EventForm;