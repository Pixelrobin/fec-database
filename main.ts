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

class ElectronMainWindow {
    window: Electron.BrowserWindow;
    contents: Electron.WebContents;

    constructor( file: string ) {
        this.window = new BrowserWindow({
            minHeight: 720,
            minWidth: 960,
            width: 960,
            height: 720
        })

        this.window.loadURL(url.format({
            pathname: path.join(__dirname, file ),
            protocol: 'file:',
            slashes: true
        }))

        ipcMain.on( "print", ( event, arg ) => {
            //this.contents.print({})
            //event.sender.send( "print-reply" );
            this.window.webContents.printToPDF({}, (error, data) => {
                if (error) throw error
                fs.writeFile('C:/Users/pixel/Junk/PRINTOUTPUT/print.pdf', data, (error) => {
                if (error) throw error

            })
            event.sender.send( "print-done" );
            })
        } )

        this.contents = this.window.webContents;
        this.contents.openDevTools();
        //this.window.setMenu(null);

        this.window.on( "closed", () => {
            this.window = null
        })

    }
}

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

ipcMain.on( "test", ( event, arg ) => {
    console.log( arg );
} )