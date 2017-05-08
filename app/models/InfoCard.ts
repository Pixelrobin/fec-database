// Card for displaying data
// Used in attendance view

// Card data interface
interface InfoCardData {
    header: number,
    value: string,
    default: string
}

class InfoCard {
    view: string = "template";
    id: string;
    template: string;
    height: number;
    data: any;
    
    constructor( id: string, dataTemplate: InfoCardData[], height?: number ) {
        this.id = id;
        this.template = "";
        this.data = {};
        
        // Add data to the ui object
        for ( let d of dataTemplate ) {
            // What a mounthful that is
            this.template += `<center><h${d.header}>#${d.value}#</h${d.header}></center>\n`;
            this.data[ d.value ] = d.default;
        }
        this.height = height === undefined ? 150 : height;
    }

    // Get the id of the element (using webix '$$' function)
    $$id(): webix.ui.template {
        return $$( this.id ) as webix.ui.template;
    }

    // Set the data on the card to display
    setData( data: any ) {
        this.$$id().parse( data, "json" );
        this.$$id().refresh();
    }
}

export = InfoCard;