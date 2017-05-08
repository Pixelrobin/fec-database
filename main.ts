// Main electron instance

import { app, BrowserWindow, ipcMain } from 'electron'
import path = require( 'path' );
import url = require( 'url' );
import sqlite3 = require( 'sqlite3' );
import fs = require( 'fs' );

import EmployeesManager = require( "./managers/EmployeesManager" );
import AttendanceManager = require( "./managers/AttendanceManager" );
import SettingsManager = require( "./managers/SettingsManager" );
import SchedulesManager = require( "./managers/SchedulesManager" )

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
            height: 720
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
            this.window.webContents.printToPDF({}, (error, data) => {
                if (error) throw error
                fs.writeFile('', data, (error) => {
                if (error) throw error

            })
            event.sender.send( "print-done" );
            })
        } )

        this.contents = this.window.webContents;
        this.contents.openDevTools();
        //this.window.setMenu(null);

        // Delete window reference on close
        this.window.on( "closed", () => {
            this.window = null
        })

    }
}

// Initiate all the managers
// Give them access to the database
EmployeesManager.init( db );
AttendanceManager.init( db );
SettingsManager.init( db );
SchedulesManager.init( db );

// Create window when ready
app.on( "ready", () => {
    main = new ElectronMainWindow( "app/index.html" )
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    db.close();
    app.quit();
});