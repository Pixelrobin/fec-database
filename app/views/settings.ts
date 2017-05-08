// Main settings view
// TODO: Make settings autosave like everythigng else
// TODO: Add theme color setting

import uiWrappers = require( "models/uiWrappers" );

export = new class {
    $ui: any;

    // Elements for each day of the week
    weekdayIds: {
        day: string,
        checkbox: string,
        start: string,
        end: string
    }[];

    // Last entry made into a week
    // Is automatically added to the next new one
    lastWeekEntry = {
        start: "10:00",
        end: "20:00"
    }

    constructor() {
        this.weekdayIds = []; // Start anew

        // Function to generate weekday options ui elements
        // Also adds elements to 'this.weekDayIds'
        const weekday = ( day: string ): webix.ui.fieldsetConfig => {
            // Add elements to 'this.weekDayIds'
            this.weekdayIds.push( {
                day: day,
                checkbox: day + "Open",
                start: day + "Start",
                end: day + "End"
            })
            
            // Return the ui
            return {
                view: "fieldset",
                label: day,
                body: {
                    rows: [
                        { view: "checkbox", id: day + "Open", label: "Open", value: 0, on: {
                            "onChange": ( value ) => {
                                
                                if ( value ) {
                                    $$( day + "Start" ).show();
                                    $$( day + "End" ).show();
                                    this.setHoursToDefault( day );
                                } else {
                                    $$( day + "Start" ).hide();
                                    $$( day + "End" ).hide();
                                }
                            }
                        } },
                        { view: "datepicker", id: day + "Start", type:"time", stringResult:true, labelWidth: 100, label: "Opening Time", hidden: true },
                        { view: "datepicker", id: day + "End", type:"time", stringResult:true, labelWidth: 100, label: "Closing Time", hidden: true }
                    ]
                } as any
            }
        }

        // Week settings form
        const weekSettings = {
            view: "form",
            scroll: true,
            width: 300,
            rows: [
                weekday( "Sunday" ),
                weekday( "Monday" ),
                weekday( "Tuesday" ),
                weekday( "Wednesday" ),
                weekday( "Thursday" ),
                weekday( "Friday" ),
                weekday( "Saturday" )
            ]
        }

        // Business settings (just the name for now)
        const businessSettings = {
            view: "form",
            scroll: true,
            width: 300,
            rows: [
                { view: "text", id: "businessName", placeholder: "Business Name", label: "Business Name", labelPosition: "top"  }
            ]
        }

        this.$ui = uiWrappers.wrapInLayout( {
            cols: [
                uiWrappers.wrapInTitle( "BuisinessTitle", businessSettings, "Business Settings", [
                    { view:"button", id:"businessSubmit", type: "form", align:"left", label: "Save", autowidth: true }
                ] ),
                uiWrappers.wrapInTitle( "HoursTitle", weekSettings, "Opening hours", [
                    { view:"button", id:"weekSubmit", type: "form", align:"left", label: "Save", autowidth: true }
                ] ),
                { view: "spacer" }
            ]
        });
    }

    // Webix init event
    $oninit = () => {
        const businessButton = $$( "businessSubmit" ) as webix.ui.button,
            weekButton       = $$( "weekSubmit"     ) as webix.ui.button;
        
        // Events
        businessButton.attachEvent( "onItemClick", () => {
            this.businessSettingsSubmit();
        })
        weekButton.attachEvent( "onItemClick", () => {
            this.weekSettingsSubmit();
        })


        // ipc Events
        ipcRenderer.send( "get-business-name" );
        ipcRenderer.on( "get-business-name-reply", ( event, arg ) => {
            this.businessSettingsPopulate( { name: arg } );
        });

        ipcRenderer.send( "get-week-settings" );
        ipcRenderer.on( "get-week-settings-reply", ( event, arg ) => {
            this.weekSettingsPopulate( arg );
        });
    }

    // Set business settings form data (just the name for now)
    businessSettingsPopulate( settings: any ): void {
        let text = $$( "businessName" ) as webix.ui.text;

        text.setValue( settings.name );
    }

    // Submit business settings
    businessSettingsSubmit(): void {
        let text = $$( "businessName" ) as webix.ui.text,
            value = text.getValue();
        
        if ( value != "" ) ipcRenderer.send( "set-business-settings", { name: value } )
        else webix.message({
            type: "error",
            text: "Business field name is empty"
        })
    }

    // Set the hours of a weekday to the last entered value
    setHoursToDefault( day: string ): void {
        let start = $$( day + "Start" ) as webix.ui.datepicker,
            end = $$( day + "End" ) as webix.ui.datepicker;
        
        // I could probably combine these somehow
        if ( start.getValue() === "" ) {
            start.setValue( this.lastWeekEntry.start );;
            start.attachEvent( "onChange", () => {
                this.lastWeekEntry.start = start.getValue()
            })
        }

        if ( end.getValue() === "" ) {
            end.setValue( this.lastWeekEntry.end );;
            end.attachEvent( "onChange", () => {
                this.lastWeekEntry.end = end.getValue()
            })
        }
    }

    // Fill week settings
    weekSettingsPopulate( settings: any ): void {
        for ( let day in settings ) {
            const checkbox = $$( this.weekdayIds[ day ].checkbox ) as webix.ui.checkbox,
                start = $$( this.weekdayIds[ day ].start ) as webix.ui.datepicker,
                end = $$( this.weekdayIds[ day ].end ) as webix.ui.datepicker;
            
            // Fill times only if the checkbox is turned on
            // This is probably not the best way to do it though...
            if ( settings[ day ].open ) {
                checkbox.setValue( "1" );
                start.setValue( settings[ day ].startHour + ":" + settings[ day ].startMinute );
                end.setValue( settings[ day ].endHour + ":" + settings[ day ].endMinute );

                checkbox.refresh();
                start.refresh();
                end.refresh();
            } else checkbox.setValue( "0" );
            
        }
    } 

    // Submit week wettings to the database
    weekSettingsSubmit(): void {
        let settings = [],
            error = false;
        
        for ( let day in this.weekdayIds ) {
            const checkbox = $$( this.weekdayIds[ day ].checkbox ) as webix.ui.checkbox,
                start      = $$( this.weekdayIds[ day ].start    ) as webix.ui.datepicker,
                end        = $$( this.weekdayIds[ day ].end      ) as webix.ui.datepicker,
                startTime  = moment( start.getValue(), "HH:mm" ),
                endTime    = moment( end.getValue(),   "HH:mm" );
            
            // Submit times only if day is set as 'open'
            if ( checkbox.getValue() ) {
                if ( endTime.isAfter( startTime ) ) {
                    settings[ day ] = {
                        $day: this.weekdayIds[ day ].day,
                        $open: 1,
                        $startHour: startTime.hour(),
                        $startMinute: startTime.minute(),
                        $endHour: endTime.hour(),
                        $endMinute: endTime.minute()
                    }
                } else {
                    webix.message({
                        type: "error",
                        text: `Date range for ${ this.weekdayIds[ day ].day } is invalid.`
                    });
                    error = true;
                    //break;
                }
            } else {
                settings[ day ] = {
                    $day: this.weekdayIds[ day ].day,
                    $open: 0,
                    $startHour: null,
                    $startMinute: null,
                    $endHour: null,
                    $endMinute: null
                }
            }
        } 

        ipcRenderer.send( "set-week-settings", settings );
    }
}