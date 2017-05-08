// Data manager for settings

import { ipcMain } from 'electron'
import sqlite3 = require( "sqlite3" );

let db: sqlite3.Database;

export function init( database: sqlite3.Database ) {
    db = database;

    // Create tables if they don't exist and fill with default values
    db.exec(
        `CREATE TABLE IF NOT EXISTS settings (
            name  TEXT UNIQUE,
            value TEXT
        );
        
        CREATE TABLE IF NOT EXISTS hours (
            id          INTEGER PRIMARY KEY,
            day         INTEGER UNIQUE,
            open        BOOLEAN,
            startHour   INTEGER,
            startMinute INTEGER,
            endHour     INTEGER,
            endMinute   INTEGER
        );
        
        INSERT OR IGNORE INTO settings( name, value ) VALUES( "Name", "Family Entertainment Center" );

        INSERT OR IGNORE INTO hours( day, open ) VALUES( "Sunday", 0 );
        INSERT OR IGNORE INTO hours( day, open ) VALUES( "Monday", 0 );
        INSERT OR IGNORE INTO hours( day, open ) VALUES( "Tuesday", 0 );
        INSERT OR IGNORE INTO hours( day, open ) VALUES( "Wednesday", 0 );
        INSERT OR IGNORE INTO hours( day, open ) VALUES( "Thursday", 0 );
        INSERT OR IGNORE INTO hours( day, open ) VALUES( "Friday", 0 );
        INSERT OR IGNORE INTO hours( day, open ) VALUES( "Saturday", 0 );
        `
    )

    // Set the business settings (just business name for now)
    ipcMain.on( "set-business-settings", ( event, arg ) => {
        db.run( `UPDATE settings SET value = ? WHERE name = "Name"`, arg.name, () => {
            event.sender.send( "reset-business-name", arg.name )
        } );
    } );

    // Get the business name
    // TODO: abstract this to get all business settings data
    // It just currently only contains a name property
    ipcMain.on( "get-business-name", ( event, arg ) => {
        db.get( `SELECT value FROM settings WHERE name="name";`, ( err, row ) => {
            event.sender.send( "get-business-name-reply", row.value )
        } );
    } );
    
    // Set the settings for the week
    // This is not autosaved like everything else
    // TODO: Make this work with autosave
    ipcMain.on( "set-week-settings", ( event, arg ) => {
        db.serialize( () => {
            for ( let day in arg ) {
                db.run( `
                    UPDATE hours SET
                        open=$open,
                        startHour=$startHour,
                        startMinute=$startMinute,
                        endHour=$endHour,
                        endMinute=$endMinute
                    WHERE day=$day;
                `, arg[ day ], ( err ) => {
                    if ( err ) console.log( err )
                } )
            }
        });
    });

    // Get the settings for the week
    ipcMain.on( "get-week-settings", ( event, arg ) => {
        db.serialize( () => {
            db.all( "SELECT * FROM hours;", ( err, rows ) => {
                event.sender.send( "get-week-settings-reply", rows );
            } )
        });
    });
}