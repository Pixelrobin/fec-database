class WeeklyEvent {
	events: FC.EventObject[]
	days: number[]
	selectCallback: Function;

	constructor( event: FC.EventObject, days: number[], selectCallback: Function ) {
		this.selectCallback = selectCallback;
	}

	//eventClick = ( event: FC.EventObject )
}

class WeeklyScheduler implements FC.Options {
	id: string;
	defaultView = "agendaWeek";
	header = false;
	allDaySlot = false;
	defaultDate = moment( new Date( 2000, 1, 1 ) );
	editable = true;
	eventBackgroundColor = "#3498db";
	
	columnFormat = "dddd";

	eventSelection: FC.EventObject = null;
	eventSelectionId: string = "";
	eventDataCallback: Function = null;
	eventDestroyCallback: Function = null;

	constructor( id: string ) {
		this.id = "#" + id;
		this.$id().fullCalendar( this ); // You Double agent this is on the job
	}

	// Object function properties
	eventClick = ( event: FC.EventObject, element: any ): void => {
		// change the border color just for fun
		if ( this.eventSelection !== null ) {
			this.eventSelection.backgroundColor = this.eventBackgroundColor;
		}

		event.backgroundColor = "red";
		this.eventSelection = event;
		
		this.sendEventCallback();
		this.$id().fullCalendar( "updateEvent", event );
	}

	// Class functions
	$id(): JQuery {
		// Get JQuery object
		return $( this.id );
	}

	addEvent( event: FC.EventObject ): void {
		// Add an event
		this.$id().fullCalendar( "renderEvent", event, true );
	}

	submitChange( newEvent: FC.EventObject ): void {
		console.log( "getting new data" );
		this.eventSelection.title = newEvent.title;
		this.eventSelection.start = newEvent.start;
		this.eventSelection.end   = newEvent.end;

		this.$id().fullCalendar( "updateEvent", this.eventSelection );
	}

	sendEventCallback() {
		if ( this.eventDataCallback !== null ) {
			this.eventSelectionId = this.generateId();
			
			this.eventDataCallback( {
				title: this.eventSelection.title,
				start: this.eventSelection.start,
				end: this.eventSelection.end,
				checkId: this.eventSelectionId
			} );
		}
	}

	destroy(): void {
		// Destroy scheduler
		this.$id().fullCalendar( "destroy" );
	}

	private generateId(): string {
		// Not a true guid, but good enough hopefully
		// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
		const s4 = () => {
			return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}
}

export = WeeklyScheduler;