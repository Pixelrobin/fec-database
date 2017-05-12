// Main electron instance
const { shell, app, BrowserWindow, ipcMain } = require( 'electron' );
import path = require( 'path' );
import url = require( 'url' );
import sqlite3 = require( 'sqlite3' );
import fs = require( 'fs' );
import temp = require( "temp" );

import EmployeesManager = require( "./managers/EmployeesManager" );
import AttendanceManager = require( "./managers/AttendanceManager" );
import SettingsManager = require( "./managers/SettingsManager" );
import SchedulesManager = require( "./managers/SchedulesManager" );

import PrintHandler = require( "./printer/PrintHandler" );

let main, db = new sqlite3.Database( "data.db" );

// Window handler class
class ElectronMainWindow {
    window: Electron.BrowserWindow;
    contents: Electron.WebContents;

    constructor( file: string ) {
        // Create the window
        this.window = new BrowserWindow({
            minHeight: 720,
            minWidth: 960,
            width: 960,
            height: 720,
            title: "FEC Database"
        })

        // load the file
        this.window.loadURL(url.format({
            pathname: path.join(__dirname, file ),
            protocol: 'file:',
            slashes: true
        }))
        
        // Handle print requests
        // NOT COMPLETE, NOT IMPLEMENTED
        ipcMain.on( "print", ( event, arg ) => {
            this.print( arg );
        });

        this.contents = this.window.webContents;
        this.contents.openDevTools();
        this.window.setMenu(null);

        // Delete window reference on close
        this.window.on( "closed", () => {
            this.window = null
        })
    }

    print( data ): void {
        if ( tempPath !== null ) {
            PrintHandler.print(
                data.elements,
                path.join( tempPath, data.filename )
            );
        }
    }
}

// Initiate all the managers
// Give them access to the database
EmployeesManager.init( db );
AttendanceManager.init( db );
SettingsManager.init( db );
SchedulesManager.init( db );

// Set up a temporary directory for storing pdf files
let tempPath = null;
temp.track(); // Delete the directory on close
temp.mkdir( "tempfiles", ( err: any, path: string ) => {
    if ( err ) throw err
    else tempPath = path;
});

// Create window when ready
app.on( "ready", () => {
    main = new ElectronMainWindow( "app/index.html" );
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    db.close();
    app.quit();
});