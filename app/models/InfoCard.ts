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
    data: any[];
    
    constructor( id: string, dataTemplate: InfoCardData[], height?: number ) {
        this.id = id;
        this.template = "";
        this.data = {};
        
        for ( let d of dataTemplate ) {
            // What a mounthful
            this.template += `<center><h${d.header}>#${d.value}#</h${d.header}></center>\n`;
            this.data[ d.value ] = d.default;
        }
        this.height = height === undefined ? 150 : height;
    }

    $$id(): webix.ui.template {
        return $$( this.id ) as webix.ui.template;
    }

    setData( data: any ) {
        this.$$id().parse( data, "json" );
        this.$$id().refresh();
    }
}

export = InfoCard;