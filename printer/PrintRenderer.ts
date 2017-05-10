import { ipcRenderer } from "electron";
import { RenderElement, DISPLAYTYPE } from "./RenderData";

/* These are the css classes for creating grids with skeleton css.
Grids are divided into sections of 12, so saying "6 columns" means
each grid element will take up 6 out of 12 slots. */
const columnLevels = [
    undefined,       // 0 columns = bad
    "u-full-width",  // 1 column
    "six columns",   // 2 columns
    "four columns",  // 3 columns
    "three columns", // 4 columns
    // Hopefully we won't need any more
]

ipcRenderer.on( "render-print-data", ( event, args ) => {
    const parseElement = ( data: RenderElement, parent: HTMLElement, level?: number  ) => {
        const column = document.createElement( "DIV" );

        column.className = columnLevels[ level === undefined ? 1 : level ];

        switch ( data.type ) {
            case DISPLAYTYPE.HEADER:
                const header = document.createElement( "HEADER" ),
                    h = document.createElement( `H${data.headerSize}` );
                    column.appendChild( header );

                h.appendChild( document.createTextNode( data.headerText ) );
                header.appendChild( h );
            break;

            case DISPLAYTYPE.TABLE:
                let ids: string[] = [];

                const table = <HTMLTableElement>        document.createElement( "TABLE" ),
                    tHead   = <HTMLTableRowElement>     table.createTHead().insertRow( 0 ),
                    tBody   = <HTMLTableSectionElement> document.createElement( "TBODY" );

                for ( let col = 0; col < data.tableCols.length; col ++ ) {
                    const cell = document.createElement( "TH" );

                    cell.innerHTML = data.tableCols[ col ].header;
                    ids.push( data.tableCols[ col ].id );
                    tHead.appendChild( cell );
                }

                for ( let r = 0; r < data.tableData.length; r ++ ) {
                    const tRow = tBody.insertRow( r );

                    for ( let i = 0; i < ids.length; i ++ ) {
                        const cell = tRow.insertCell( i );
                        cell.innerHTML = data.tableData[ r ][ ids[ i ] ];
                    }
                }

                table.className = "u-full-width";
                table.appendChild( tBody );
                column.appendChild( table );

            break;

            case DISPLAYTYPE.MULTICOLUMN:
                for ( let columnElement of data.columns ) {
                    parseElement( columnElement, column, data.columns.length );
                }
            break;
        }
        
        parent.appendChild( column );
    }
    
    const row = document.createElement( "DIV" );

    row.className = "row"; // Skeleton css 'row' class
    for ( let element of args ) {
        parseElement( element, row );
    }

    document.body.appendChild( row );
    ipcRenderer.send( "print-data-rendered" );

});

window.onload = () => {
    console.log( "document loaded" );
    ipcRenderer.send( "print-renderer-ready" )
}