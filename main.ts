import { app, BrowserWindow, ipcMain } from 'electron'
import path = require( 'path' );
import url = require( 'url' );
import sqlite3 = require( 'sqlite3' );

import EmployeesManager = require( "./managers/EmployeesManager" );

let main, db = new sqlite3.Database( "data.db" );

class ElectronMainWindow {
    window: Electron.BrowserWindow
    
    constructor( file: string ) {
        this.window = new BrowserWindow({
            width: 800,
            height: 600
        })

        this.window.loadURL(url.format({
            pathname: path.join(__dirname, file ),
            protocol: 'file:',
            slashes: true
        }))

        this.window.webContents.openDevTools();

        this.window.on( "closed", () => {
            this.window = null
        })

    }
}

EmployeesManager.init( db );

// Create window when ready
app.on( "ready", () => {
    main = new ElectronMainWindow( "app/index.html" )
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    db.close();
    app.quit();
});

ipcMain.on( "test", ( event, arg ) => {
    console.log( arg );
} )