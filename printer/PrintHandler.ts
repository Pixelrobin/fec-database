// Handler function for printing data

import { shell, BrowserWindow, ipcMain } from "electron"
import { RenderElement } from "./RenderData"
import path = require( 'path' );
import url = require( 'url' );
import fs = require( 'fs' );

// Main print function
export function print( data: RenderElement[], filepath: string ): void {
    // Create a new hidden window
    let window = new BrowserWindow({
        resizable: false,
        show: false,
        x: 0,
        y: 0,
        width: 2000
    });

    // Load 'printer.html' into it
    // This also starts 'PrintRenderer', which actually renders the data
    window.loadURL(url.format({
        pathname: path.join(__dirname, "printer.html" ),
        protocol: 'file:',
        slashes: true
    }));

    //window.webContents.openDevTools(); // Debug purposes
    
    // Once the 'PrintRenderer' is ready, send the data
    ipcMain.once( "print-renderer-ready", ( event, args ) => {
        event.sender.send( "render-print-data", data );
    });
    
    // Once 'PrintRenderer' rendered the data...
    ipcMain.once( "print-data-rendered", ( event, args ) => {
        // Create a PDF of it
        // I could use webContents.print() to print directly,
        // but this would be more convinient for the user since they
        // can preview and 'save as' using their favorite pdf viewer
        window.webContents.printToPDF({}, ( error, data ) => {
            if (error) throw error
            
            // Write the file to the directory given
            // In this case, it's to a temporary directory
            fs.writeFile( filepath, data, (error) => {
                if (error) throw error
                else shell.openExternal( filepath );
            })

            // Close the window, we're done here.
            window.close();
        })
    });
}