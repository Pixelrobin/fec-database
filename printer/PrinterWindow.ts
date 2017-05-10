import { shell, BrowserWindow, ipcMain } from "electron"
import { RenderElement } from "./RenderData"
import path = require( 'path' );
import url = require( 'url' );
import fs = require( 'fs' );

class PrinterWindow {
    window: Electron.BrowserWindow;

    constructor( data: RenderElement[] ) {
        this.window = new BrowserWindow({
            resizable: false,
            show: false,
            x: 0,
            y: 0,
            width: 2000
        })

        this.window.loadURL(url.format({
            pathname: path.join(__dirname, "printer.html" ),
            protocol: 'file:',
            slashes: true
        }));

        this.window.webContents.openDevTools();
        
        ipcMain.once( "print-renderer-ready", ( event, args ) => {
            console.log( "renderer is ready" )
            event.sender.send( "render-print-data", data );
        });
        
        ipcMain.once( "print-data-rendered", ( event, args ) => {
            this.window.webContents.printToPDF({}, ( error, data ) => {
                if (error) throw error
                
                fs.writeFile( "C:/Users/pixel/Junk/PRINTOUTPUT/print.pdf" , data, (error) => {
                    if (error) throw error
                    else shell.openExternal( "C:/Users/pixel/Junk/PRINTOUTPUT/print.pdf" );
                })

                this.window.close();
            })
        });
    }
}

export = PrinterWindow;