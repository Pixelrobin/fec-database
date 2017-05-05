import uiWrappers = require( "models/uiWrappers" );

export = new class {
    $ui: any;

    constructor() {
        let calendar: webix.ui.templateConfig = {
            view: "template",
            template: "<div id='calendar'></div>",
            id: "calendar"
        }

        let list: webix.ui.datatableConfig = {
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
        
        let form = {
            view: "form",
            autoheight: false,
            elements: [
                { view: "text", placeholder: "Ex. Putlock lunch", label: "Event Name", labelPosition: "top"  },
                { view: "textarea", placeholder: "Description goes here", label: "Description", labelPosition: "top" },
                { cols: [
                    { view:"button", value:"Save", type: "form" },
                    { view:"button", value:"Cancel" }
                ]}

            ]
        }

        const buttons = [
            { view:"button", id:"addEvent", type: "form", align:"left", label: "Add Event", autowidth: true },
            { view:"button", id:"deleteEvent", type: "danger", align:"left", label: "Delete Event", autowidth: true }
        ]

        this.$ui = uiWrappers.wrapInLayout( {
                cols: [
                    {
                        margin: 10,
                        rows: [
                            uiWrappers.wrapInTitle( list, "Schedules"    ),
                            uiWrappers.wrapInTitle( form, "Event Editor" )
                        ]
                    },
                    uiWrappers.wrapInTitle( calendar, "Outlook", buttons ),
                    
                ]
            }
        )
    }

    $oninit() {
        const calendarElement = $( "#calendar" );
        
        const createCalendar  = () => {
                console.log( "creating calendar");
                $( "#calendar" ).fullCalendar({
                    defaultView: "agendaWeek",
                    views: {
                        week: {
                            columnFormat: "dddd"
                        }
                },
                    header: false,
                    allDaySlot: false
                });
            }
        
        if ( calendarElement.length <= 0 ) {
            $$( "calendar" ).attachEvent( "onAfterRender", createCalendar );
        } else createCalendar()
    }

    $ondestroy() {
        $( "#calendar" ).fullCalendar( "destroy" );
    }
}