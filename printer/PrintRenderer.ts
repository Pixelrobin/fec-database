// Renderer side for printing window
// This is run from printer.html, which is run from 'PrintHandler'

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

/* This function renders all the data into the document using
Javascript DOM elements recursively.*/
ipcRenderer.on( "render-print-data", ( event, args ) => {
    // Recursive parsing function
    const parseElement = ( elements: RenderElement[], parent: HTMLElement, level?: number  ) => {
        const column = document.createElement( "DIV" );

        // Choose appropriate column size
        column.className = columnLevels[ level === undefined ? 1 : level ];

        // Render all passed elements
        for ( let e = 0; e < elements.length; e ++ ) {
            const data = elements[ e ];

            // Switch case for different types of values
            switch ( data.type ) {
                // Header element
                case "header":
                    const header = document.createElement( "HEADER" ),
                        h = document.createElement( `H${data.headerSize}` );
                        column.appendChild( header );
                    
                    h.appendChild( document.createTextNode( data.headerText ) );
                    header.appendChild( h );
                break;

                // Table element
                case "table":
                    let ids: string[] = [];

                    // table elements
                    const table = <HTMLTableElement>        document.createElement( "TABLE" ),
                        tHead   = <HTMLTableRowElement>     table.createTHead().insertRow( 0 ),
                        tBody   = <HTMLTableSectionElement> document.createElement( "TBODY" );

                    // Create the table heading
                    for ( let col = 0; col < data.tableCols.length; col ++ ) {
                        const cell = document.createElement( "TH" );

                        cell.innerHTML = data.tableCols[ col ].header;
                        ids.push( data.tableCols[ col ].id );
                        tHead.appendChild( cell );
                    }

                    // fill the table with the data
                    for ( let r = 0; r < data.tableData.length; r ++ ) {
                        const tRow = tBody.insertRow( r );

                        for ( let i = 0; i < ids.length; i ++ ) {
                            const cell = tRow.insertCell( i );
                            cell.innerHTML = data.tableData[ r ][ ids[ i ] ];
                        }
                    }

                    // Add the table to the page
                    table.className = "u-full-width";
                    table.appendChild( tBody );
                    column.appendChild( table );

                break;

                // Multicolumn element (allows mutiple elements per row)
                case "multicolumn":
                    // Render the elements recursively
                    // Don't use with more than one layer of recursion though!
                    for ( let columnElements of data.columns ) {
                        parseElement( columnElements, column, data.columns.length );
                    }
                break;
            }
        }
        
        // Add column to parent
        parent.appendChild( column );
    }
    
    // Parse the elements row by row
    // This is why multiple layers of recursion probably won't work
    for ( let element of args ) {
        const row = document.createElement( "DIV" );

        row.className = "row"; // Skeleton css 'row' class
        parseElement( [ element ], row );
        document.body.appendChild( row );
    }

    // Let 'PrintHandler' know we're done
    ipcRenderer.send( "print-data-rendered" );

});

// Start when everything is loaded
window.onload = () => {
    // Let 'PrintHandler' know we're ready.
    ipcRenderer.send( "print-renderer-ready" )
}