import uiWrappers = require( "models/uiWrappers" );

export = new class {
    $ui: any;

    weekdayIds: {
        day: string,
        checkbox: string,
        start: string,
        end: string
    }[];

    lastWeekEntry = {
        start: "10:00",
        end: "20:00"
    }

    constructor() {
        this.weekdayIds = [];

        const weekday = ( day: string ): webix.ui.fieldsetConfig => {
            this.weekdayIds.push( {
                day: day,
                checkbox: day + "Open",
                start: day + "Start",
                end: day + "End"
            })

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
                                    this.checkForFirstShow( day );
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

    $oninit = () => {
        let businessButton = $$( "businessSubmit" ) as webix.ui.button,
            weekButton = $$( "weekSubmit" ) as webix.ui.button;
        
        businessButton.attachEvent( "onItemClick", () => {
            this.businessSettingsSubmit();
        })

        weekButton.attachEvent( "onItemClick", () => {
            this.weekSettingsSubmit();
        })

        ipcRenderer.send( "get-business-name" );
        ipcRenderer.on( "get-business-name-reply", ( event, arg ) => {
            this.businessSettingsPopulate( { name: arg } );
        });

        ipcRenderer.send( "get-week-settings" );
        ipcRenderer.on( "get-week-settings-reply", ( event, arg ) => {
            this.weekSettingsPopulate( arg );
        });
    }

    businessSettingsPopulate( settings: any ): void {
        let text = $$( "businessName" ) as webix.ui.text;

        text.setValue( settings.name );
    }

    businessSettingsSubmit(): void {
        let text = $$( "businessName" ) as webix.ui.text,
            value = text.getValue();
        
        if ( value != "" ) ipcRenderer.send( "set-business-settings", { name: value } )
        else webix.message({
            type: "error",
            text: "Business field name is empty"
        })
    }

    checkForFirstShow( day: string ) {
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

    weekSettingsPopulate( settings: any ): void {
        for ( let day in settings ) {
            const checkbox = $$( this.weekdayIds[ day ].checkbox ) as webix.ui.checkbox,
                start = $$( this.weekdayIds[ day ].start ) as webix.ui.datepicker,
                end = $$( this.weekdayIds[ day ].end ) as webix.ui.datepicker;
            
            if ( settings[ day ].open ) {
                checkbox.setValue( "1" );
                start.setValue( settings[ day ].startHour + ":" + settings[ day ].startMinute );
                end.setValue( settings[ day ].endHour + ":" + settings[ day ].endMinute );

                checkbox.refresh();
                start.refresh();
                end.refresh();
            } else {
                checkbox.setValue( "0" );
            }
            
        }
    } 

    weekSettingsSubmit(): void {
        let settings = [],
            error = false;
        
        for ( let day in this.weekdayIds ) {
            const checkbox = $$( this.weekdayIds[ day ].checkbox ) as webix.ui.checkbox,
                start = $$( this.weekdayIds[ day ].start ) as webix.ui.datepicker,
                end = $$( this.weekdayIds[ day ].end ) as webix.ui.datepicker,
                startTime = moment( start.getValue(), "HH:mm" ),
                endTime = moment( end.getValue(), "HH:mm" );
            
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