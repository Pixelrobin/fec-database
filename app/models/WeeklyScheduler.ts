// Weekly Scheduler ui
// Extends the FullCalendar object

class WeeklyScheduler implements FC.Options {
	// FullCalendar options
	id: string;
	defaultView = "agendaWeek";
	header = false;
	allDaySlot = false;
	defaultDate = new Date( 2006, 0, 1 );
	editable = true;
	eventBackgroundColor = "#3498db";
	height: "auto";
	columnFormat = "dddd";

	// Event Selections
	eventSelection: FC.EventObject = null;
	eventSelectionId: string = "";
	
	// Callbacks
	eventDataCallback: Function = null;
	eventDestroyCallback: Function = null;

	constructor( id: string ) {
		this.id = "#" + id;
	}

	// Object function properties

	// On event click
	eventClick = ( event: FC.EventObject, element: any ) => {
		if ( this.eventSelection !== null ) {
			this.eventSelection.backgroundColor = this.eventBackgroundColor;
		}

		event.backgroundColor = "red";
		this.eventSelection = event;
		
		this.sendEventCallback( this.eventSelection );
		this.$id().fullCalendar( "updateEvent", event );
	}

	// On event dragged
	eventDrop = ( event: FC.EventObject ) => {
		this.sendEventCallback( event, true );
	}

	// On event resized
	eventResize = ( event: FC.EventObject ) => {
		this.sendEventCallback( event, true );
	}

	// Class functions

	// Initiate the FullCalendar
	init(): void {
		this.$id().fullCalendar( this ); // You Double agent this is on the job
	}

	// Get the JQuery id of the calendar
	$id(): JQuery {
		return $( this.id );
	}

	// Add an event to the calendar
	addEvent( event: any, skipCallback?: boolean ): void {
		// Give it an eventId if it doesn't have one
		if ( !event.eventId ) event.eventId = this.generateId();
		
		// Set the id that FullCalendar uses
		event.id = this.generateId();

		// Render event
		this.$id().fullCalendar( "renderEvent", event, false );
		
		// Callback if needed
		if ( skipCallback !== true ) this.sendEventCallback( event, true );
	}

	// Delete an event
	deleteEvent(): void {
		// Make sure it exists first
		if ( this.eventSelection ) {
			this.sendEventDestroyCallback( this.eventSelection );
			this.$id().fullCalendar( "removeEvents", this.eventSelection.id );
		}
	}

	// Submit a change to an event
	submitChange( newEvent: FC.EventObject ): void {
		this.eventSelection.title = newEvent.title;
		this.eventSelection.start = newEvent.start;
		this.eventSelection.end   = newEvent.end;

		this.sendEventCallback( this.eventSelection, true );
		this.$id().fullCalendar( "updateEvent", this.eventSelection );
	}

	// Send callback for a destroyed event
	sendEventDestroyCallback( event ) {
		if ( this.eventDestroyCallback !== null ) {
			this.eventDestroyCallback( (event as any).eventId );
		}
	}

	// Send callback for a changed or added event
	sendEventCallback( event, skipForm?: boolean ) {
		// Use 'skipForm' to set whether to update the form
		// (Used for 'views/schedules.ts' implementation)
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

	// Get all the events on the scheduler
	getAllEvents(): FC.EventObject[] {
		return this.$id().fullCalendar( "clientEvents" );
	}
	
	// Clear all the calendar events
	clear(): void {
		this.$id().fullCalendar( "removeEvents" );
		this.$id().fullCalendar( "removeEventSources" );
	}

	// Destroy scheduler
	destroy(): void {
		this.$id().fullCalendar( "destroy" );
	}

	// Generate a random string id
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