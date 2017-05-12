// Data manager for schedules

import { ipcMain } from 'electron'
import sqlite3 = require( "sqlite3" );

let db: sqlite3.Database;

export function init( database: sqlite3.Database ) {
    db = database;

    // Create tables if they don't exist
    db.exec(`
        CREATE TABLE IF NOT EXISTS schedules (
            name TEXT,
            id INTEGER PRIMARY KEY
        );
        
        CREATE TABLE IF NOT EXISTS scheduleData (
            eventId TEXT UNIQUE NOT NULL,
            scheduleId TEXT NOT NULL,
            title TEXT,
            startTime TEXT,
            endTime TEXT,
            day INTEGER,
            FOREIGN KEY( scheduleId ) REFERENCES schedules( id )
        );
    `
    )

    // Get a list of schedule names
    ipcMain.on( "get-schedule-names", ( event, arg ) => {
        returnScheduleNames( event );
    });

    // Get events in a certain schedule
    ipcMain.on( "get-schedule-events", ( event, arg ) => {
        db.serialize( () => {
            db.all( `SELECT * FROM scheduleData WHERE scheduleId = ?`, arg, ( err, rows ) => {
                if ( err ) throw err;
                event.sender.send( "get-schedule-events-reply", rows );
            })
        })
    });

    // Add a new schedule
    ipcMain.on( "add-schedule", ( event, arg ) => {
        db.serialize( () => {
            db.run(
                "INSERT INTO schedules( name ) VALUES( ? );",
                [ arg ], ( err ) => {
                    if ( err ) throw err;
                    else returnScheduleNames( event );
                }
            );
        });
    });

    // Set a schedule's name
    ipcMain.on( "set-schedule-name", ( event, arg ) => {
        db.serialize( () => {
            db.run(
                `UPDATE schedules SET
                    name = ?
                WHERE id = ?`, [
                    arg.name, arg.id
                ], ( err ) => {
                    if ( !err ) throw err;
                    else returnScheduleNames( event );
                }
            )
        } );
    } );

    // Delete a schedule, including all it's events
    ipcMain.on( "delete-schedule", ( event, arg ) => {
        db.serialize( () => {
            db.run( `DELETE FROM scheduleData WHERE scheduleId = ?`, arg );
            db.run( `DELETE FROM schedules WHERE id = ?`, arg, ( err ) => {
                if ( err ) throw err;
                else returnScheduleNames( event );
            });
        })
    })

    // Create or update an event
    ipcMain.on( "submit-event", ( event, args ) => {
        console.log( "submitting event ", args.$eventId );
        db.serialize( () => {
            db.run( `
                INSERT OR REPLACE INTO scheduleData(
                    eventId, scheduleId, title, startTime, endTime, day
                ) VALUES (
                    $eventId, $scheduleId, $title, $startTime, $endTime, $day
                );
            `, args, ( err ) => { if ( err ) throw err } )
        })
    });

    // Delete an event
    ipcMain.on( "delete-event", ( event, args ) => {
        db.serialize( () => {
            db.run( `
                DELETE FROM scheduleData WHERE eventId = ?
            `, args, ( err ) => { if ( err ) throw err } )
        })
    })

}

// Return all the schedule names
// Function because it's used mutiple times
function returnScheduleNames( event: Electron.IpcMainEvent ) {
    db.serialize( () => {
        db.all( "SELECT * FROM schedules;", ( err, rows ) => {
            if ( err ) throw err;
            else event.sender.send( "get-schedule-names-reply", rows )
        });
    })
}