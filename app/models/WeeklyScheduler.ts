class WeeklyScheduler implements FC.Options {
	id: string;
	defaultView = "agendaWeek";
	header = false;
	allDaySlot = false;
	defaultDate = new Date( 2006, 0, 1 );
	editable = true;
	eventBackgroundColor = "#3498db";
	height: "auto";
	
	columnFormat = "dddd";

	eventSelection: FC.EventObject = null;
	eventSelectionId: string = "";
	eventDataCallback: Function = null;
	eventDestroyCallback: Function = null;

	constructor( id: string ) {
		this.id = "#" + id;
	}

	// Object function properties
	eventClick = ( event: FC.EventObject, element: any ) => {
		// change the border color just for fun
		if ( this.eventSelection !== null ) {
			this.eventSelection.backgroundColor = this.eventBackgroundColor;
		}

		event.backgroundColor = "red";
		this.eventSelection = event;
		
		this.sendEventCallback( this.eventSelection );
		this.$id().fullCalendar( "updateEvent", event );

		console.log( this.eventSelection );
	}

	eventDrop = ( event: FC.EventObject ) => {
		this.sendEventCallback( event, true );
	}

	eventResize = ( event: FC.EventObject ) => {
		this.sendEventCallback( event, true );
	}

	// Class functions
	init(): void {
		this.$id().fullCalendar( this ); // You Double agent this is on the job
	}

	$id(): JQuery {
		// Get JQuery object
		return $( this.id );
	}

	addEvent( event: any, skipCallback?: boolean ): void {
		// Add an event
		if ( !event.eventId ) event.eventId = this.generateId();
		event.id = this.generateId();
		this.$id().fullCalendar( "renderEvent", event, false );
		if ( skipCallback !== true ) this.sendEventCallback( event, true );
		//this.$id().fullCalendar( "refresh" );
	}

	deleteEvent(): void {
		if ( this.eventSelection ) {
			this.sendEventDestroyCallback( this.eventSelection );
			this.$id().fullCalendar( "removeEvents", this.eventSelection.id );
		}
	}

	submitChange( newEvent: FC.EventObject ): void {
		console.log( "getting new data" );
		this.eventSelection.title = newEvent.title;
		this.eventSelection.start = newEvent.start;
		this.eventSelection.end   = newEvent.end;

		this.sendEventCallback( this.eventSelection, true );
		this.$id().fullCalendar( "updateEvent", this.eventSelection );
	}

	sendEventDestroyCallback( event ) {
		if ( this.eventDestroyCallback !== null ) {
			this.eventDestroyCallback( (event as any).eventId );
		}
	}

	sendEventCallback( event, skipForm?: boolean ) {
		if ( this.eventDataCallback !== null ) {
			skipForm = skipForm === undefined ? false : skipForm;
			this.eventDataCallback( {
				skipForm: skipForm,
				event: {
					eventId: (event as any).eventId,
					title: event.title,
					start: event.start,
					end: event.end
				}
			});
		}
	}
	
	clear(): void {
		this.$id().fullCalendar( "removeEvents" );
		this.$id().fullCalendar( "removeEventSources" );
		//this.$id().fullCalendar( "destroy" );
		//this.$id().fullCalendar( this );
	}

	destroy(): void {
		// Destroy scheduler
		this.$id().fullCalendar( "destroy" );
	}

	private generateId(): string {
		// Not real guids but good enough
		// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
	}

}

export = WeeklyScheduler;